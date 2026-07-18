export function IntroSection(): JSX.Element {
  return (
    <section className="intro" id="top" aria-label="Introduction">
      <div className="intro__content">
        <div className="intro__left">
          <h1 className="intro__headline">
            Hear <em>everything</em>.
            <br />
            Carry <em>nothing</em>.
          </h1>

          <p className="intro__sub">
            A case that opens in one motion and buds that wake before you've
            finished raising your hand.
          </p>

          <div className="intro__cue" aria-hidden="true">
            <span>Scroll ↓</span>
          </div>
        </div>

        <div className="intro__right">
          <img
            src="/images/airpods.png"
            alt="AirPods Pro 2"
            className="intro__image"
          />
        </div>
      </div>
    </section>
  );
}