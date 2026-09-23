import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import "./Dealers.css";
import "../assets/style.css";
import Header from '../Header/Header';


const PostReview = () => {
  const [dealer, setDealer] = useState({});
  const [review, setReview] = useState("");
  const [model, setModel] = useState();
  const [year, setYear] = useState("");
  const [date, setDate] = useState("");
  const [carmodels, setCarmodels] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  let params = useParams();
  let id =params.id;
  let root_url = window.location.origin;
  let dealer_url = root_url+`/djangoapp/dealer/${id}`;
  let review_url = root_url+`/djangoapp/add_review`;
  let carmodels_url = root_url+`/djangoapp/get_cars`;

  const postreview = async (event)=>{
    event.preventDefault();
    setError("");
    if(!model || review.trim() === "" || date === "" || year === "") {
      setError("All details are mandatory.");
      return;
    }

    let model_split = model.split(" ");
    let make_chosen = model_split[0];
    let model_chosen = model_split.slice(1).join(" ");
    let firstName = sessionStorage.getItem("firstname");
    let lastName = sessionStorage.getItem("lastname");
    let username = sessionStorage.getItem("username");
    let name = firstName && lastName ? `${firstName} ${lastName}` : username;

    setSubmitting(true);

    let jsoninput = JSON.stringify({
      "name": name,
      "dealership": id,
      "review": review.trim(),
      "purchase": true,
      "purchase_date": date,
      "car_make": make_chosen,
      "car_model": model_chosen,
      "car_year": year,
    });

    console.log(jsoninput);
      try {
        const res = await fetch(review_url, {
          method: "POST",
          credentials: "include",
          headers: {
              "Content-Type": "application/json",
          },
          body: jsoninput,
        });

        const json = await res.json();
        if (res.ok && json.status === 200) {
          window.location.href = window.location.origin+"/dealer/"+id;
        } else {
          setError(json.message || "The review could not be submitted.");
        }
      } catch (requestError) {
        setError("Unable to connect to the server.");
      } finally {
        setSubmitting(false);
      }

  }
  const get_dealer = async ()=>{
    const res = await fetch(dealer_url, {
      method: "GET"
    });
    const retobj = await res.json();
    
    if(retobj.status === 200) {
      if(retobj.dealer)
        setDealer(retobj.dealer)
    }
  }

  const get_cars = async ()=>{
    const res = await fetch(carmodels_url, {
      method: "GET"
    });
    const retobj = await res.json();
    
    let carmodelsarr = Array.from(retobj.CarModels)
    setCarmodels(carmodelsarr)
  }
  useEffect(() => {
    get_dealer();
    get_cars();
  },[]);


  return (
    <div>
      <Header/>
      <main className="post-review-page">
        <section className="post-review-card">
          <p className="post-review-eyebrow">SHARE YOUR EXPERIENCE</p>
          <h1>{dealer.full_name || "Loading dealership..."}</h1>
          <p className="post-review-description">Tell other customers about your experience with this dealership.</p>
          <form onSubmit={postreview}>
            <label htmlFor="review">Your review</label>
            <textarea id="review" rows="7" value={review} onChange={(e) => setReview(e.target.value)} required />

            <div className="post-review-fields">
              <label htmlFor="purchase-date">Purchase date</label>
              <input id="purchase-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />

              <label htmlFor="car-model">Car make and model</label>
              <select id="car-model" value={model || ""} onChange={(e) => setModel(e.target.value)} required>
                <option value="" disabled>Choose your car</option>
                {carmodels.map(carmodel => (
                  <option key={`${carmodel.CarMake}-${carmodel.CarModel}`} value={`${carmodel.CarMake} ${carmodel.CarModel}`}>
                    {carmodel.CarMake} {carmodel.CarModel}
                  </option>
                ))}
              </select>

              <label htmlFor="car-year">Car year</label>
              <input id="car-year" type="number" value={year} onChange={(e) => setYear(e.target.value)} max="2023" min="2015" required />
            </div>

            {error && <p className="post-review-error" role="alert">{error}</p>}
            <button className="postreview" type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Post Review"}
            </button>
          </form>
        </section>
      </main>
    </div>
  )
}
export default PostReview
