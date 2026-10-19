
import { useState } from "react";
import { Country, State, City } from "country-state-city";

function LocationSelector({ onLocationChange }) {
  const countries = Country.getAllCountries();

  const [countryCode, setCountryCode] = useState("IN");
  const [stateCode, setStateCode] = useState("TN");
  const [cityName, setCityName] = useState("Chennai");

  const states = State.getStatesOfCountry(countryCode);

  const cities = stateCode
    ? City.getCitiesOfState(countryCode, stateCode)
    : City.getCitiesOfCountry(countryCode);

  function notifyLocation(nextCountryCode, nextStateCode, nextCity) {
    const selectedCountry = countries.find(
      (item) => item.isoCode === nextCountryCode
    );

    const selectedState = State.getStatesOfCountry(
      nextCountryCode
    ).find((item) => item.isoCode === nextStateCode);

    onLocationChange?.({
      country: selectedCountry?.name || "",
      countryCode: nextCountryCode,
      state: selectedState?.name || "",
      stateCode: nextStateCode,
      city: nextCity,
    });
  }

  function handleCountryChange(event) {
    const nextCode = event.target.value;

    setCountryCode(nextCode);
    setStateCode("");
    setCityName("");

    notifyLocation(nextCode, "", "");
  }

  function handleStateChange(event) {
    const nextCode = event.target.value;

    setStateCode(nextCode);
    setCityName("");

    notifyLocation(countryCode, nextCode, "");
  }

  function handleCityChange(event) {
    const nextCity = event.target.value;

    setCityName(nextCity);
    notifyLocation(countryCode, stateCode, nextCity);
  }

  return (
    <section className="location-selector">
      <div className="location-selector-heading">
        <div>
          <h2>Choose Your Location</h2>
          <p>Select a country, state, and city to monitor air quality.</p>
        </div>
      </div>

      <div className="location-fields">
        <label>
          Country
          <select
            value={countryCode}
            onChange={handleCountryChange}
          >
            {countries.map((country) => (
              <option key={country.isoCode} value={country.isoCode}>
                {country.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          State / Province / Region
          <select
            value={stateCode}
            onChange={handleStateChange}
          >
            <option value="">Select a state or region</option>
            {states.map((item) => (
              <option key={item.isoCode} value={item.isoCode}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          City
          <select
            value={cityName}
            onChange={handleCityChange}
          >
            <option value="">Select a city</option>
            {cities.map((item, index) => (
              <option
                key={`${item.name}-${index}`}
                value={item.name}
              >
                {item.name}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}

export default LocationSelector;
