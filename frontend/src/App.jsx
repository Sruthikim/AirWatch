import { useState, useEffect } from "react";
import "./App.css";
import "leaflet/dist/leaflet.css";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

import CitySelector from "./components/CitySelector";
import AQICard from "./components/AQICard";
import AQITrendChart from "./components/AQITrendChart.jsx";
import PollutantChart from "./components/PollutantChart";
import Sidebar from "./components/Sidebar";
import AirQualityAlerts from "./components/AirQualityAlerts";
import PollutionOverview from "./components/PollutionOverview";
import cityTrendData from "./data/cityTrendData";
import LocationSelector from "./components/LocationSelector";

const API_BASE_URL = "https://airwatch-backend-qrhq.onrender.com";
const defaultCenter = [13.0827, 80.2707];

const stationIcon = L.divIcon({
  className: "airwatch-map-marker",
  html: '<div class="map-marker-dot"></div>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

function MapCenter({ center }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, 11);
  }, [center, map]);

  return null;
}

function AirQualityMap({ stations, selectedCity }) {
  const firstStation = stations.find(
    (station) =>
      Number.isFinite(Number(station.latitude)) &&
      Number.isFinite(Number(station.longitude))
  );

  const center = firstStation
    ? [Number(firstStation.latitude), Number(firstStation.longitude)]
    : defaultCenter;

  return (
    <div className="map-container">
      <div className="map-heading">
        <div>
          <p className="section-label">GEOGRAPHIC OVERVIEW</p>
          <h2>Monitoring Stations</h2>
        </div>
        <span className="map-count">
          {stations.length} stations
        </span>
      </div>

      <MapContainer
        center={center}
        zoom={11}
        scrollWheelZoom
        className="airwatch-map"
      >
        <MapCenter center={center} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {stations.map((station) => {
          const latitude = Number(station.latitude);
          const longitude = Number(station.longitude);

          if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude)
          ) {
            return null;
          }

          return (
            <Marker
              key={station.id}
              position={[latitude, longitude]}
              icon={stationIcon}
            >
              <Popup>
                <strong>{station.name || `Station ${station.id}`}</strong>
                <br />
                Station ID: {station.id}
                <br />
                Coordinates: {latitude.toFixed(4)}, {longitude.toFixed(4)}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      <p className="map-note">
        Markers indicate monitoring-station locations. They do not represent
        live AQI levels unless corresponding readings are loaded.
      </p>
    </div>
  );
}

function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [city, setCity] = useState("Chennai");
  const [liveAirData, setLiveAirData] = useState(null);
  const [stationName, setStationName] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [stations, setStations] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(
    new Date().toLocaleTimeString()
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setLastUpdated(new Date().toLocaleTimeString());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchCityData() {
      setLoading(true);
      setApiError("");
      setLiveAirData(null);
      setStationName("");
      setStations([]);

      try {
        const locationsResponse = await fetch(
          `${API_BASE_URL}/api/locations?country=IN&city=${encodeURIComponent(city)}`
        );
        const locationsData = await locationsResponse.json();

        if (!locationsResponse.ok || !locationsData.success) {
          throw new Error(
            locationsData.message || "Could not find monitoring stations."
          );
        }

        const cityStations = (locationsData.results || []).filter(
          (station) => station.id
        );

        if (cancelled) return;

        setStations(
          cityStations
            .filter((station) => {
              const coords = station.coordinates;
              return (
                coords &&
                Number.isFinite(Number(coords.latitude)) &&
                Number.isFinite(Number(coords.longitude))
              );
            })
            .map((station) => ({
              id: station.id,
              name: station.name,
              latitude: Number(station.coordinates.latitude),
              longitude: Number(station.coordinates.longitude),
            }))
        );

        if (!cityStations.length) {
          throw new Error(`No monitoring stations found for ${city}.`);
        }

        const stationResults = await Promise.all(
          cityStations.slice(0, 8).map(async (station) => {
            try {
              const response = await fetch(
                `${API_BASE_URL}/api/aqi?locationId=${station.id}`
              );
              const data = await response.json();

              if (!response.ok || !data.success) return null;

              const readings = data.readings || {};
              const hasReadings = ["pm25", "pm10", "no2", "so2"].some(
                (key) =>
                  readings[key] !== null &&
                  readings[key] !== undefined &&
                  Number.isFinite(Number(readings[key]))
              );

              if (!hasReadings) return null;

              const dates = Object.values(data.measurementDates || {})
                .filter(Boolean)
                .sort();

              return {
                locationId: station.id,
                stationName: station.name || `Station ${station.id}`,
                readings,
                estimatedAqi:
                  data.estimatedAqi !== null &&
                  data.estimatedAqi !== undefined &&
                  Number.isFinite(Number(data.estimatedAqi))
                    ? Number(data.estimatedAqi)
                    : null,
                measurementDates: data.measurementDates || {},
                latestDate: dates.at(-1) || null,
                note: data.note || "",
              };
            } catch {
              return null;
            }
          })
        );

        const usableStations = stationResults.filter(Boolean);

        usableStations.sort((a, b) => {
          const aHasAqi = a.estimatedAqi !== null;
          const bHasAqi = b.estimatedAqi !== null;

          if (aHasAqi !== bHasAqi) {
            return Number(bHasAqi) - Number(aHasAqi);
          }

          const count = (item) =>
            ["pm25", "pm10", "no2", "so2"].filter(
              (key) => item.readings[key] != null
            ).length;

          if (count(a) !== count(b)) return count(b) - count(a);

          return new Date(b.latestDate || 0) - new Date(a.latestDate || 0);
        });

        if (cancelled) return;

        const match = usableStations[0];

        if (!match) {
          throw new Error(
            `Stations were found for ${city}, but no usable pollutant readings were available.`
          );
        }

        setLiveAirData(match);
        setStationName(match.stationName);
        setLastUpdated(new Date().toLocaleTimeString());
      } catch (error) {
        if (!cancelled) {
          setApiError(error.message || "Unable to load air-quality data.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchCityData();

    return () => {
      cancelled = true;
    };
  }, [city]);

  const readings = liveAirData?.readings || {};

  const hasAqi =
    liveAirData?.estimatedAqi !== null &&
    liveAirData?.estimatedAqi !== undefined &&
    Number.isFinite(Number(liveAirData.estimatedAqi));

  const currentData = {
    aqi: hasAqi ? liveAirData.estimatedAqi : "N/A",
    pm25: readings.pm25 ?? "N/A",
    pm10: readings.pm10 ?? "N/A",
    no2: readings.no2 ?? "N/A",
    so2: readings.so2 ?? "N/A",
  };

  const selectedTrendData =
    cityTrendData[city] || cityTrendData.Chennai;

  const handleCityChange = (newCity) => {
    setCity(newCity);
  };

  const renderDashboard = () => (
  <>
    <section className="page-heading">
      <div>
        <p className="section-label">AIR QUALITY INTELLIGENCE</p>
        <h1>Good to see you.</h1>
        <p>Here's the air-quality overview for {city}.</p>
      </div>

      <div className="header-city">
        <span>Monitoring city</span>
        <CitySelector city={city} setCity={handleCityChange} />
      </div>
    </section>

    {/* Country, State and City Selection */}
    <LocationSelector
      onLocationChange={(location) => {
        console.log("Selected location:", location);
      }}
    />

    <div className="dashboard-summary">
      <div className="summary-item">
        <span className="summary-label">LAST UPDATED</span>
        <strong>{lastUpdated}</strong>
      </div>

      <div className="summary-item">
        <span className="summary-label">SELECTED CITY</span>
        <strong>{city}</strong>
      </div>

      <div className="summary-item">
        <span className="summary-label">DATA STATUS</span>
        <strong>
          {loading ? "Loading..." : apiError ? "Unavailable" : "Connected"}
        </strong>
      </div>
    </div>

    {loading && <p>Searching for monitoring stations and readings...</p>}
    {apiError && <p role="alert">{apiError}</p>}

    <div className="aqi-overview">
      <div className="aqi-overview-main">
        <span className="overview-label">ESTIMATED AIR QUALITY INDEX</span>
        <div className="aqi-number">{loading ? "..." : currentData.aqi}</div>
        <p>Preliminary estimate, not official CPCB AQI</p>
      </div>

      <div className="aqi-overview-info">
        <h3>{city} Air Quality</h3>
        <p>
          {liveAirData
            ? `Measurements from ${stationName}. Check the measurement date before interpreting current conditions.`
            : "Air-quality measurements will appear when station data is available."}
        </p>

        {liveAirData?.latestDate && (
          <p>
            Latest measurement:{" "}
            {new Date(liveAirData.latestDate).toLocaleString()}
          </p>
        )}
      </div>
    </div>

    <div className="cards">
      <AQICard
        title="PM2.5"
        value={currentData.pm25}
        unit="µg/m³"
        description="Fine particulate matter"
      />
      <AQICard
        title="PM10"
        value={currentData.pm10}
        unit="µg/m³"
        description="Coarse particulate matter"
      />
      <AQICard
        title="NO₂"
        value={currentData.no2}
        unit="ppb"
        description="Nitrogen dioxide"
      />
      <AQICard
        title="SO₂"
        value={currentData.so2}
        unit="ppb"
        description="Sulfur dioxide"
      />
    </div>

    <AirQualityMap stations={stations} selectedCity={city} />

    <p className="data-disclaimer">
      AirWatch displays the latest measurements returned by the provider;
      these may be historical rather than live.
    </p>
  </>
);

const renderAirQuality = () => (
  <>
    <section className="page-heading">
      <div>
        <p className="section-label">POLLUTANT MONITORING</p>
        <h1>Air Quality</h1>
        <p>Readings from the selected monitoring station.</p>
      </div>

      <CitySelector city={city} setCity={handleCityChange} />
    </section>

    <div className="aqi-overview">
      <div className="aqi-overview-main">
        <span className="overview-label">ESTIMATED AQI</span>
        <div className="aqi-number">
          {loading ? "..." : currentData.aqi}
        </div>
        <p>Preliminary estimate only</p>
      </div>

      <div className="aqi-overview-info">
        <h3>{city}</h3>
        <p>{stationName || "No monitoring station selected"}</p>
        <p>
          {apiError ||
            (loading ? "Loading readings..." : "Latest available measurements")}
        </p>
      </div>
    </div>

    <div className="cards">
      <AQICard
        title="PM2.5"
        value={currentData.pm25}
        unit="µg/m³"
        description="Fine particulate matter"
      />
      <AQICard
        title="PM10"
        value={currentData.pm10}
        unit="µg/m³"
        description="Coarse particulate matter"
      />
      <AQICard
        title="NO₂"
        value={currentData.no2}
        unit="ppb"
        description="Nitrogen dioxide"
      />
      <AQICard
        title="SO₂"
        value={currentData.so2}
        unit="ppb"
        description="Sulfur dioxide"
      />
    </div>

    <PollutionOverview data={currentData} />

    <p className="data-disclaimer">
      This estimated AQI is not an official CPCB calculation.
      Measurement dates may be historical.
    </p>
  </>
);

  const renderTrends = () => (
    <>
      <section className="page-heading">
        <div>
          <p className="section-label">HISTORICAL ANALYTICS</p>
          <h1>Trends & Analytics</h1>
          <p>Explore sample pollutant and AQI trends for {city}.</p>
        </div>
        <CitySelector city={city} setCity={handleCityChange} />
      </section>

      <section className="section-box">
        <h2>Pollutant Trends</h2>
        <PollutantChart data={selectedTrendData.pollutants} />
      </section>

      <section className="section-box">
        <h2>AQI Trend</h2>
        <p>These charts currently use the project's sample trend dataset, not station history.</p>
        <AQITrendChart data={selectedTrendData.aqi} />
      </section>
    </>
  );

  const renderAlerts = () => (
    <>
      <section className="page-heading">
        <div>
          <p className="section-label">HEALTH & SAFETY</p>
          <h1>Air Quality Alerts</h1>
          <p>Alerts based on available pollutant readings.</p>
        </div>
      </section>
      <AirQualityAlerts data={currentData} />
    </>
  );

  const renderAbout = () => (
    <>
      <section className="page-heading">
        <div>
          <p className="section-label">ABOUT THE PROJECT</p>
          <h1>About AirWatch</h1>
          <p>Urban air-quality monitoring and pollution insights.</p>
        </div>
      </section>
      <section className="section-box">
        <h2>Our Purpose</h2>
        <p>
          AirWatch is an air-quality monitoring project developed using the
          MERN stack. It presents AQI estimates, PM2.5, PM10, NO₂ and SO₂
          measurements, monitoring-station locations, trends and alerts where
          data is available.
        </p>
        <p>
          The AQI displayed is a preliminary estimate based on simplified
          PM2.5 and PM10 breakpoints. It is not an official CPCB AQI.
        </p>
      </section>
    </>
  );

  const pages = {
    dashboard: renderDashboard,
    "air-quality": renderAirQuality,
    trends: renderTrends,
    alerts: renderAlerts,
    about: renderAbout,
  };

  return (
    <div className="app">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      <main className="dashboard">
        <div className="topbar">
          <div>
            <span className="topbar-eyebrow">AIRWATCH / MONITORING</span>
            <p>Environmental Intelligence Platform</p>
          </div>
          <div className="topbar-status">
            <span className="status-dot" />
            Monitoring system
          </div>
        </div>

        <div className="page-content" key={activePage}>
          {pages[activePage]()}
        </div>

        <footer className="app-footer">
          © 2026 AirWatch — Urban Air Quality Monitoring System
        </footer>
      </main>
    </div>
  );
}

export default App;