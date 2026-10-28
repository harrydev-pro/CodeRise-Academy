import { Component } from "react";

export default class AppErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return <main className="app-error"><h1>This page could not load</h1><p>Please reload the page. If the issue continues, contact support.</p><button onClick={() => window.location.reload()}>Reload page</button></main>;
    }
    return this.props.children;
  }
}
