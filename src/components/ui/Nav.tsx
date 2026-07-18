export function Nav(): JSX.Element {
  return (
    <header className="nav">
      <a className="nav__mark" href="#top">
        <span className="nav__mark-dot" aria-hidden="true" />
        Apple Store
      </a>
     <div className="nav__meta">
  <nav>
    <ul>
      <li>Home</li>
      <li>About</li>
      <li>Contact Us</li>
    </ul>
  </nav>
</div>
    </header>
  );
}
 