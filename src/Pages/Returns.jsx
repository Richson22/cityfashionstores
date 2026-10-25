import InfoPage from "../components/InfoPage.jsx";
import { getSettings } from "../Admin/settingsStore.js";

// ---- confirm these with the client ----
const DAYS = 7; // days after delivery to ask for a return or exchange
const REFUND_DAYS = "3–5 business days"; // how long a refund takes

export default function Returns() {
  const st = getSettings();
  const wa = `https://wa.me/${st.whatsapp}?text=${encodeURIComponent(
    "Hi, I would like to return or exchange an item. My order number is #"
  )}`;

  return (
    <InfoPage
      title="RETURNS & EXCHANGE"
      intro={`Not the right fit? No wahala. You have ${DAYS} days after delivery to ask for a return or an exchange.`}
    >
      <div className="inf-facts">
        <div>
          <b>{DAYS} days</b>
          <span>to request a return or exchange after delivery</span>
        </div>
        <div>
          <b>Easy swaps</b>
          <span>exchange for another size or color, if we have it in stock</span>
        </div>
        <div>
          <b>{REFUND_DAYS}</b>
          <span>for a refund to reach you once we approve it</span>
        </div>
      </div>

      <section className="inf-sec">
        <h2>How it works</h2>
        <ol className="inf-steps">
          <li>
            <i>1</i>
            <div>
              <b>Message us</b>
              <p>Send us your order number and the reason on WhatsApp, with a clear photo of the item.</p>
            </div>
          </li>
          <li>
            <i>2</i>
            <div>
              <b>We confirm</b>
              <p>We check your request and tell you if it is approved, usually within one business day.</p>
            </div>
          </li>
          <li>
            <i>3</i>
            <div>
              <b>Send it back</b>
              <p>Pack the item with its tags and send it to us. We will give you the address and how to send it.</p>
            </div>
          </li>
          <li>
            <i>4</i>
            <div>
              <b>Refund or new item</b>
              <p>When it arrives and passes our check, we refund you or send out your exchange.</p>
            </div>
          </li>
        </ol>
      </section>

      <section className="inf-sec">
        <h2>What can be returned</h2>
        <div className="inf-lists">
          <div>
            <h3 className="yes">Accepted</h3>
            <ul>
              <li>Unworn, unwashed items with the original tags attached</li>
              <li>Items in the original packaging</li>
              <li>Items that arrived wrong, damaged or faulty</li>
              <li>Requests made within {DAYS} days of delivery</li>
            </ul>
          </div>
          <div>
            <h3 className="no">Not accepted</h3>
            <ul>
              <li>Boxers, singlets and other underwear (for hygiene)</li>
              <li>Items that were worn, washed, altered or damaged after delivery</li>
              <li>Items without their tags</li>
              <li>Requests made after {DAYS} days</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="inf-sec">
        <h2>Refunds</h2>
        <p>
          Once we receive your item and check it, we refund the price of the item to the same way you paid. A refund
          takes about {REFUND_DAYS} to reach you. Delivery fees are not refunded unless the item was wrong or
          faulty.
        </p>
      </section>

      <section className="inf-sec">
        <h2>Exchanges</h2>
        <p>
          You can swap an item for another size or color, as long as we have it in stock. If the new item costs more,
          you pay the difference. If it costs less, we refund the difference. If we do not have it in stock, we will
          offer a refund instead.
        </p>
      </section>

      <section className="inf-sec">
        <h2>Wrong or damaged item?</h2>
        <p>
          Tell us within 48 hours of delivery, with photos of the item and the packaging. We will fix it at no cost to
          you, with a new item or a full refund including delivery.
        </p>
      </section>

      <section className="inf-sec">
        <h2>Return delivery</h2>
        <p>
          For a change of mind or a size swap, the customer pays to send the item back. If the mistake was ours, we
          pay.
        </p>
      </section>

      <div className="inf-cta">
        <div>
          <b>Need to return or exchange something?</b>
          <span>Message us with your order number and we will sort it out.</span>
        </div>
        <a href={wa} target="_blank" rel="noreferrer" className="inf-btn">Message us on WhatsApp</a>
      </div>

      {st.email && (
        <p className="inf-note">
          You can also email us at <a href={`mailto:${st.email}`}>{st.email}</a>.
        </p>
      )}
    </InfoPage>
  );
}