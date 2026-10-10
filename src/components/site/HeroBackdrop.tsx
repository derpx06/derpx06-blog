import s from "./HeroBackdrop.module.scss";

/** Cursor-reactive hero backdrop. Place inside `<HeroFx className="hero ...">`; it reads --mx/--my. */
export function HeroBackdrop() {
  return (
    <div className={s.backdrop} aria-hidden="true">
      <div className={s.glow} />
      <div className={s.spot} />
      <div className={s.dots} />
      <div className={s.hot} />
      <div className={`heroFade ${s.fade}`} />
    </div>
  );
}
