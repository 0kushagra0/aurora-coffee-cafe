import { useState } from "react";
import { ArrowDownRight, ArrowUpRight, HeartHandshake, MapPin, Menu, Navigation, Sparkles, Wifi, X } from "lucide-react";
import ScrollSequence from "@/components/ScrollSequence";

const COFFEE_CUP = "/site-images/coffee-cup.jpg";
const CAFE_INTERIOR = "/site-images/cafe-interior.jpg";
const ESPRESSO = "/site-images/espresso-extraction.png";

const benefits = [
  { kicker: "01 / Work well", title: "Good Wi-Fi, better focus", copy: "Settle in with dependable Wi-Fi, generous tables, and the kind of quiet that lets good work happen.", icon: Wifi, image: CAFE_INTERIOR },
  { kicker: "02 / Feel welcome", title: "Service with a human touch", copy: "Our baristas remember the little things — your order, your pace, and how you like your morning to feel.", icon: HeartHandshake, image: COFFEE_CUP },
  { kicker: "03 / Stay fresh", title: "A spotless daily ritual", copy: "From the counter to the last table, every corner is cared for so you can relax into the moment.", icon: Sparkles, image: ESPRESSO },
];
const gallery = [
  { label: "The pour", title: "A little warmth in every cup", copy: "Comfort, crema, and a slower first sip.", image: COFFEE_CUP, tone: "#5d4534" },
  { label: "The room", title: "Designed for staying awhile", copy: "Soft light, warm timber, and space to settle in.", image: CAFE_INTERIOR, tone: "#83917a" },
  { label: "The craft", title: "Watch the good stuff happen", copy: "A close look at the detail behind every pour.", image: ESPRESSO, tone: "#b8794f" },
];

function Mark({ light = false }: { light?: boolean }) {
  return <span className={`aurora-mark ${light ? "aurora-mark--light" : ""}`}><span className="aurora-mark__ring" /><span className="aurora-mark__spark">✦</span></span>;
}

function Benefits() {
  const [active, setActive] = useState(0);
  return <section className="benefits section-dark" id="ritual">
    <div className="section-rail"><span>02</span><span className="section-rail__line" /><span>Why Aurora</span></div>
    <div className="benefits__intro"><p className="eyebrow light">The Aurora difference</p><h2>More than<br /><em>good coffee.</em></h2><p>Come for the cup, stay for everything around it: thoughtful service, a comfortable room, and a space that feels looked after.</p></div>
    <div className="benefits__selector" role="tablist" aria-label="Aurora café benefits">{benefits.map((item, i) => { const Icon = item.icon; return <button key={item.kicker} className={`benefit ${active === i ? "is-active" : ""}`} onClick={() => setActive(i)} role="tab" aria-selected={active === i}><div className="benefit__image" style={{ backgroundImage: `url(${item.image})` }}><span className="benefit__index">{item.kicker}</span><Icon size={20} /><span className="benefit__pulse" /></div><div className="benefit__content"><h3>{item.title}</h3><p>{item.copy}</p><span className="benefit__read">Discover the detail <ArrowUpRight size={14} /></span></div></button>; })}</div>
    <div className="benefits__foot"><span>Small lots / long tables / no rush</span><span>Scroll to continue ↓</span></div>
  </section>;
}

function Gallery() {
  return <section className="gallery" id="gallery"><div className="gallery__intro"><div><p className="eyebrow">A closer look</p><h2>Image <em>gallery</em></h2></div><p>Step inside Aurora — from the first pour to the room where good mornings stretch a little longer.</p></div><div className="gallery__stack">{gallery.map((item, i) => <article className="gallery-card" key={item.title} style={{ backgroundColor: item.tone }}><img src={item.image} alt={item.title} /><div className="gallery-card__shade" /><div className="gallery-card__meta"><span>0{i + 1}</span><span>{item.label}</span></div><div className="gallery-card__copy"><h3>{item.title}</h3><p>{item.copy}</p></div></article>)}</div><div className="gallery__end">The ritual is the reward <ArrowDownRight size={17} /></div></section>;
}

function Contact() {
  return <section className="contact section-dark" id="visit"><div className="section-rail"><span>05</span><span className="section-rail__line" /><span>Find Aurora</span></div><div className="contact__heading"><p className="eyebrow light">Come by soon</p><h2>Ready for a<br /><em>truly great cup?</em></h2><p>Bring a book, bring a friend, or bring nothing at all. We’ll have the coffee waiting.</p><a className="button button--caramel" href="https://www.google.com/maps/search/?api=1&query=East+Village+New+York" target="_blank" rel="noreferrer">Get directions <Navigation size={15} /></a></div><div className="contact__map-wrap"><div className="contact__map-label"><MapPin size={16} /><span>14 Orchard Street<br /><small>East Village, New York</small></span></div><iframe title="Map showing Aurora Caffee in the East Village" src="https://www.openstreetmap.org/export/embed.html?bbox=-73.996%2C40.721%2C-73.982%2C40.731&layer=mapnik&marker=40.726%2C-73.989" loading="lazy" /></div><footer className="footer"><div className="footer__brand"><Mark light /><span>Aurora</span><small>coffee / counter culture</small></div><div className="footer__links"><div><span>Open daily</span><a href="#visit">Mon—Fri / 7—4</a><a href="#visit">Sat—Sun / 8—5</a></div><div><span>Follow along</span><a href="#top">Instagram</a><a href="#top">Journal</a></div><div><span>Say hello</span><a href="mailto:hello@lumencoffee.example">hello@lumencoffee.example</a><a href="tel:+12125550144">+1 212 555 0144</a></div></div><div className="footer__bottom"><span>© 2026 Aurora Caffee</span><span>Made for slow mornings</span><a href="#top">Back to top ↑</a></div></footer></section>;
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  return <div className="site-shell"><header className="nav"><a className="wordmark" href="#top"><Mark /><span>Aurora</span></a><nav className={menuOpen ? "nav__links is-open" : "nav__links"}><a href="#ritual">The ritual</a><a href="#gallery">Gallery</a><a href="#visit">Visit us</a></nav><button className="nav__menu" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Close menu" : "Open menu"}>{menuOpen ? <X size={18} /> : <Menu size={18} />}</button><a className="nav__order" href="#visit">Order ahead <ArrowUpRight size={14} /></a></header><main><ScrollSequence /><Benefits /><Gallery /><Contact /></main></div>;
}
