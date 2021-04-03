
import './Spinner.css';

export const Spinner = ({ position }) => {
  return (
    <div className="loading-spinner" style={{ ...position }}></div>
  )
}

Spinner.defaultProps = {
  position: { left: 25, top: 25 }
}
