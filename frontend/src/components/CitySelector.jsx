function CitySelector({ city, setCity }) {
  return (
    <div className="city-selector">

      <div className="city-selector-text">
        <span>📍</span>

        <div>
          <label htmlFor="city-select">
            Monitoring Location
          </label>

          <p>
            Select a city to view air quality data
          </p>
        </div>
      </div>

      <select
        id="city-select"
        value={city}
        onChange={(e) => setCity(e.target.value)}
      >
        <option value="Chennai">Chennai</option>
        <option value="Delhi">Delhi</option>
        <option value="Mumbai">Mumbai</option>
        <option value="Kolkata">Kolkata</option>
        <option value="Bangalore">Bangalore</option>
      </select>

    </div>
  );
}

export default CitySelector;