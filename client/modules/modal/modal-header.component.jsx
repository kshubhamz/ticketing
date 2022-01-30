export const ModalHeader = ({ title, onCloseClick }) => {
  return (
    <div className="modal-header">
      <h5>{title}</h5>
      <button
        type="button"
        className="btn-close"
        aria-label="Close"
        onClick={onCloseClick}
      ></button>
    </div>
  );
};
