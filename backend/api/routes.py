from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import JSONResponse
from typing import Dict,List, Any, Optional
from pydantic import BaseModel
import math
from itertools import permutations


import numpy as np
from sklearn.cluster import DBSCAN,KMeans

import requests
import os
import json
import re

import google.generativeai as genai

from config.settings import GOOGLE_API_KEY_CITY, GOOGLE_API_KEY_MONUMENT, GOOGLE_GEMINI_API_KEY, GOOGLE_ITENARY_API_KEY

from api.dedup import is_duplicate, clear_duplicates

router = APIRouter()


@router.get("/api/monuments")
def get_monuments(cities: list[str] = Query(...)):
    key = GOOGLE_API_KEY_MONUMENT
    if not key:
        return {"error": "Google API key not found"}

    results = []
    id_counter = 1

    for city in cities:
        query = f"monuments, historical landmarks, tourist attractions, and places to visit in {city}"
        search_url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
        search_params = {"query": query, "key": key}
        search_res = requests.get(search_url, params=search_params).json()

        for place in search_res.get("results", [])[:10]:
            place_id = place.get("place_id")
            if is_duplicate(place_id):
                continue
            if place.get("rating", 0.0) < 3.8 or place.get("user_ratings_total", 0) < 300:
                continue

            detail_url = "https://maps.googleapis.com/maps/api/place/details/json"
            detail_params = {
                "place_id": place_id,
                "fields": "name,formatted_address,opening_hours,website,rating,photos,geometry",
                "key": key
            }
            details = requests.get(detail_url, params=detail_params).json().get("result", {})

            monument = {
                "id": id_counter,
                "name": details.get("name", "Unknown"),
                "city": city.strip(", "),
                "state": "",
                "rating": details.get("rating", 0.0),
                "description": details.get("formatted_address", "A popular monument."),
                "formatted_address": details.get("formatted_address"),
                "website": details.get("website"),
                "opening_hours": details.get("opening_hours", {}).get("weekday_text", []),
                "photo_url": None,
                "lat": details.get("geometry", {}).get("location", {}).get("lat"),
                "lng": details.get("geometry", {}).get("location", {}).get("lng")
            }

            if "photos" in details:
                ref = details["photos"][0]["photo_reference"]
                monument["photo_url"] = f"https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference={ref}&key={key}"

            results.append(monument)
            id_counter += 1

    return {"results": results}


@router.get("/api/full-day")
def get_full_day_activities(cities: list[str] = Query(...)):
    key = GOOGLE_API_KEY_MONUMENT
    if not key:
        return {"error": "Google API key for full-day not configured."}

    activities = []
    id_counter = 1000

    for city in cities:
        query = f"full day attractions, theme parks, film cities, resorts, and amusement parks in {city}"
        url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
        resp = requests.get(url, params={"query": query, "key": key}).json()

        for place in resp.get("results", [])[:10]:
            place_id = place.get("place_id")
            if is_duplicate(place_id):
                continue
            if place.get("rating", 0.0) < 3.8 or place.get("user_ratings_total", 0) < 300:
                continue

            detail_url = "https://maps.googleapis.com/maps/api/place/details/json"
            detail_params = {
                "place_id": place_id,
                "fields": "name,formatted_address,opening_hours,website,rating,photos,geometry",
                "key": key
            }
            details = requests.get(detail_url, params=detail_params).json().get("result", {})

            experience = {
                "id": id_counter,
                "name": details.get("name", "Unknown Experience"),
                "city": city.strip(","),
                "state": "",
                "rating": details.get("rating", 0.0),
                "description": details.get("formatted_address", "A full-day activity."),
                "formatted_address": details.get("formatted_address"),
                "website": details.get("website"),
                "opening_hours": details.get("opening_hours", {}).get("weekday_text", []),
                "photo_url": None,
                "lat": details.get("geometry", {}).get("location", {}).get("lat"),
                "lng": details.get("geometry", {}).get("location", {}).get("lng")
            }

            if "photos" in details:
                ref = details["photos"][0]["photo_reference"]
                experience["photo_url"] = f"https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference={ref}&key={key}"

            activities.append(experience)
            id_counter += 1

    return {"activities": activities}


@router.post("/api/reset-monuments")
def reset_monument_cache():
    clear_duplicates()
    return {"status": "cleared"}



@router.get("/api/cities")
def get_cities(state: str):
    if not GOOGLE_API_KEY_CITY:
        return {"error": "Google API key for cities not configured."}

    query = f"cities in {state} India"
    url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
    params = {
        "query": query,
        "key": GOOGLE_API_KEY_CITY
    }

    response = requests.get(url, params=params)
    return response.json() if response.status_code == 200 else {"error": "Failed to fetch data"}




genai.configure(api_key=GOOGLE_GEMINI_API_KEY) # type: ignore

@router.get("/api/city-order")
def get_city_order(cities: list[str] = Query(...)):
    if not cities:
        raise HTTPException(status_code=400, detail="No cities provided.")

    prompt = (
        f"You are a travel planner. Given this list of cities: {', '.join(cities)}.\n"
        "Step 1: Identify the most prominent or major city among them — one that is most likely to have good airport/train connectivity. "
        "This city must be fixed as the starting point of the trip (entry city).\n"
        "Step 2: Optimize the remaining cities in the best possible logical travel sequence for minimal distance and time.\n"
        "Return ONLY a JSON array of city names in the final travel order, starting with the identified entry city."
    )

    try:
        
        model = genai.GenerativeModel("gemini-2.5-flash-lite-preview-06-17")  # type: ignore
        response = model.generate_content(prompt)
        content = response.text.strip()

        try:
            ordered = json.loads(content)
        except json.JSONDecodeError:
            match = re.search(r"\[[^\]]+\]", content, re.DOTALL)
            if match:
                ordered = json.loads(match.group())
            else:
                raise HTTPException(status_code=500, detail="Could not extract valid JSON array from Gemini response.")

        return JSONResponse({"orderedCities": ordered})

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini error: {str(e)}")
    

#-----------------------------------------------------------------------------------------------------------------------------------#
#-----------------------------------------------------------------------------------------------------------------------------------#
#-----------------------------------------------------------------------------------------------------------------------------------#
#-----------------------------------------------------------------------------------------------------------------------------------#




class Monument(BaseModel):
    id: int
    name: str
    city: str
    lat: float
    lng: float
    type: str

class OutlierRequest(BaseModel):
    cityWiseSelection: dict
    interCityMap: List[int]
    orderedCities: List[str]

@router.post("/api/compute-outliers")
async def compute_outliers(data: OutlierRequest):
    updated = {}

    for idx, city in enumerate(data.orderedCities):
        city_data = data.cityWiseSelection.get(city)
        if not city_data:
            updated[city] = {
                "monuments": [],
                "outliers": []
            }
            continue

        monuments_raw = city_data.get("monuments", [])
        count = 1 if data.interCityMap[idx] in [1, 2] else 2 if data.interCityMap[idx] == 3 else 0

        if count == 0 or len(monuments_raw) < count:
            updated[city] = {
                "monuments": monuments_raw,
                "outliers": []
            }
            continue

        coords = np.radians([[m["lat"], m["lng"]] for m in monuments_raw])
        kms_per_radian = 6371.0088
        db = DBSCAN(eps=2.0 / kms_per_radian, min_samples=2, algorithm='ball_tree', metric='haversine')
        labels = db.fit_predict(coords)

        raw_outliers = [m for i, m in enumerate(monuments_raw) if labels[i] == -1]
        outliers = raw_outliers[:count]

        def avg_dist(mon):
            return np.mean([
                np.linalg.norm(np.array([mon["lat"], mon["lng"]]) - np.array([other["lat"], other["lng"]]))
                for other in monuments_raw if mon != other
            ])

        if len(outliers) < count:
            remaining = [m for m in monuments_raw if m not in outliers]
            remaining.sort(key=avg_dist, reverse=True) # type: ignore
            extra_needed = count - len(outliers)
            outliers += remaining[:extra_needed]

        filtered = [m for m in monuments_raw if m not in outliers]

        updated[city] = {
            "monuments": filtered,
            "outliers": outliers
        }

    return updated


#-----------------------------------------------------------------------------------------------------------------------------------#
#-----------------------------------------------------------------------------------------------------------------------------------#
#----------------------------------------------------K-means------------------------------------------------------------------------#
#-----------------------------------------------------------------------------------------------------------------------------------#




class KMeansClusteringRequest(BaseModel):
    monuments: List[Monument]
    max_per_cluster: int = 4

@router.post("/api/cluster-monuments")
async def cluster_monuments(data: KMeansClusteringRequest):
    monuments = data.monuments
    max_per_cluster = data.max_per_cluster

    if not monuments:
        return {"clusters": []}

    coords = np.array([[m.lat, m.lng] for m in monuments])
    num_clusters = int(np.ceil(len(monuments) / max_per_cluster))

    try:
        kmeans = KMeans(n_clusters=num_clusters, random_state=42)
        labels = kmeans.fit_predict(coords)
    except Exception as e:
        return {"error": f"KMeans clustering failed: {str(e)}"}

    clusters: Dict[int, List[Dict]] = {}
    for label, monument in zip(labels, monuments):
        if label not in clusters:
            clusters[label] = []
        clusters[label].append(monument.dict())

    sorted_clusters = [clusters[key] for key in sorted(clusters.keys())]

    final_clusters = []
    overflow = []

    for cluster in sorted_clusters:
        if len(cluster) <= max_per_cluster:
            final_clusters.append(cluster)
        else:
            final_clusters.append(cluster[:max_per_cluster])
            overflow.extend(cluster[max_per_cluster:])

    for mon in overflow:
        placed = False
        for cluster in final_clusters:
            if len(cluster) < max_per_cluster:
                cluster.append(mon)
                placed = True
                break
        if not placed:
            final_clusters.append([mon])

    return {"clusters": final_clusters}






#-----------------------------------------------------------------------------------------------------------------------------------#
#-----------------------------------------------------------------------------------------------------------------------------------#
#----------------------------------------------------Gemini-------------------------------------------------------------------------#
#-----------------------------------------------------------------------------------------------------------------------------------#




genai.configure(api_key=GOOGLE_ITENARY_API_KEY)  # type: ignore

class ItineraryDay(BaseModel):
    type: str  # "full-day", "monument", "inter-city"
    monuments: List[dict]

class ItineraryRequest(BaseModel):
    cities: List[str]
    days: List[ItineraryDay]

@router.post("/api/generate-itinerary")
async def generate_itinerary(data: ItineraryRequest):
    cities = data.cities
    days = data.days

    if not cities or not days:
        raise HTTPException(status_code=400, detail="Cities and day-wise data are required.")

    try:
        all_day_itineraries = []

        for index, day_info in enumerate(days):
            day_number = index + 1
            day_type = day_info.type
            monuments = day_info.monuments
            monuments_list = ", ".join([m["name"] for m in monuments]) or "No monuments"
            city = monuments[0].get("city", "Unknown") if monuments else "Unknown"

            if day_type == "full-day":
                prompt = (
                    f"You are a travel assistant helping plan a full-day experience for a traveler in India.\n"
                    f"Day: {day_number}\n"
                    f"City: {city}\n"
                    f"Monument: {monuments_list}\n\n"
                    f"The traveler will spend the entire day at this single monument or park.\n"
                    f"Write a rich, immersive itinerary that:\n"
                    f"- Starts with 'Start your day at...'\n"
                    f"- Includes time-based events, exploring exhibits, food stalls, photo spots, gardens, rest areas\n"
                    f"- Mentions local tips and enjoyable moments\n\n"
                    f"Wrap your output as JSON:\n"
                    f"{{\n"
                    f"  \"day\": {day_number},\n"
                    f"  \"city\": \"{city}\",\n"
                    f"  \"plan\": \"<detailed itinerary paragraph>\"\n"
                    f"}}\n"
                    f"Only return valid JSON."
                )

            elif day_type == "monument":
                prompt = (
                    f"You are a travel assistant creating a day's sightseeing itinerary in India.\n"
                    f"Day: {day_number}\n"
                    f"City: {city}\n"
                    f"Monuments: {monuments_list}\n\n"
                    f"Craft a flowing, engaging itinerary for the day:\n"
                    f"- Begin with 'Start your day at...'\n"
                    f"- Include realistic timings (e.g., 9:00 AM)\n"
                    f"- Add chai/snack breaks, street scenes, transport\n"
                    f"- Mention brief highlights at each monument\n\n"
                    f"Respond in valid JSON:\n"
                    f"{{\n"
                    f"  \"day\": {day_number},\n"
                    f"  \"city\": \"{city}\",\n"
                    f"  \"plan\": \"<detailed itinerary paragraph>\"\n"
                    f"}}"
                )

            elif day_type == "inter-city":
                city_from = monuments[0].get("city", "Unknown") if len(monuments) > 0 else "Unknown"
                city_to = monuments[1].get("city", "Unknown") if len(monuments) > 1 else "Unknown"
                from_monument = monuments[0].get("name", "Place A") if len(monuments) > 0 else "Place A"
                to_monument = monuments[1].get("name", "Place B") if len(monuments) > 1 else "Place B"

                prompt = (
                    f"You are a travel assistant planning an inter-city journey day in India.\n"
                    f"Day: {day_number}\n"
                    f"Start City: {city_from}\n"
                    f"Destination City: {city_to}\n"
                    f"Morning Monument: {from_monument}\n"
                    f"Evening Monument: {to_monument}\n\n"
                    f"Write an itinerary that:\n"
                    f"- Begins in the origin city, visits the first monument\n"
                    f"- Mentions transport to the destination (train, car)\n"
                    f"- Includes local snacks, rest breaks\n"
                    f"- Ends with visiting the 2nd monument and settling down\n\n"
                    f"Format JSON like this:\n"
                    f"{{\n"
                    f"  \"day\": {day_number},\n"
                    f"  \"city\": \"{city_from} to {city_to}\",\n"
                    f"  \"plan\": \"<bullet-point format itinerary>\"\n"
                    f"}}"
                )

            else:
                raise HTTPException(status_code=400, detail=f"Invalid day type '{day_type}' for day {day_number}")

            model = genai.GenerativeModel("gemini-2.5-pro")  # type: ignore
            response = model.generate_content(prompt)
            content = response.text.strip()

            try:
                itinerary_entry = json.loads(content)
            except json.JSONDecodeError:
                match = re.search(r"\{.*\}", content, re.DOTALL)
                if match:
                    itinerary_entry = json.loads(match.group())
                else:
                    raise HTTPException(status_code=500, detail=f"Invalid JSON for day {day_number}.")

            all_day_itineraries.append(itinerary_entry)

        return JSONResponse(content={"itinerary": all_day_itineraries})

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini itinerary error: {str(e)}")




#-----------------------------------------------------------------------------------------------------------------------------------#
#-----------------------------------------------------------------------------------------------------------------------------------#
#--------------------------------------------------Display routes-------------------------------------------------------------------#
#-----------------------------------------------------------------------------------------------------------------------------------#


GOOGLE_MAPS_ROUTE_KEY = os.getenv("GOOGLE_API_KEY_INDEX", "")

class POI(BaseModel):
    name: str
    lat: float
    lng: float

class DayRouteInput(BaseModel):
    rawItinerary: List[Dict[str, Any]]

def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371
    φ1, φ2 = math.radians(lat1), math.radians(lat2)
    Δφ = math.radians(lat2 - lat1)
    Δλ = math.radians(lon2 - lon1)
    a = math.sin(Δφ/2)**2 + math.cos(φ1)*math.cos(φ2)*math.sin(Δλ/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

def compute_optimal_poi_path(pois: List[Dict[str, Any]]) -> List[int]:
    n = len(pois)
    if n <= 1:
        return list(range(n))
    best_order: Optional[List[int]] = None
    min_dist = float("inf")
    for perm in permutations(range(1, n - 1)):
        path = [0] + list(perm) + [n - 1]
        dist = 0.0
        for i in range(len(path) - 1):
            p, q = pois[path[i]], pois[path[i+1]]
            dist += haversine(p["lat"], p["lng"], q["lat"], q["lng"])
        if dist < min_dist:
            min_dist = dist
            best_order = path
    return best_order or list(range(n))

@router.post("/api/generate-day-route")
def generate_day_route(payload: DayRouteInput):
    output_routes = []

    for entry in payload.rawItinerary:
        day_num = entry.get("day")
        pois = entry.get("monuments", [])

        route_entry = {
            "day": day_num,
            "places": pois,
            "polyline": None
        }

        if len(pois) >= 2:
            order = compute_optimal_poi_path(pois)
            ordered = [pois[i] for i in order]

            origin      = f"{ordered[0]['lat']},{ordered[0]['lng']}"
            destination = f"{ordered[-1]['lat']},{ordered[-1]['lng']}"
            mids = ordered[1:-1]
            waypoints = "|".join(f"{m['lat']},{m['lng']}" for m in mids)

            params = {
                "origin": origin,
                "destination": destination,
                "key": GOOGLE_MAPS_ROUTE_KEY,
                **({"waypoints": waypoints} if waypoints else {})
            }
            resp = requests.get(
                "https://maps.googleapis.com/maps/api/directions/json",
                params=params
            ).json()

            routes = resp.get("routes", [])
            if routes:
                route_entry["polyline"] = routes[0]["overview_polyline"]["points"]
                route_entry["places"]   = ordered

        output_routes.append(route_entry)

    return {"routes": output_routes}
