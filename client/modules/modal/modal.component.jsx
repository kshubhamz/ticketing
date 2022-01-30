import { useEffect, useState } from "react";
import { ModalBody } from "./modal-body.component";
import { ModalFooter } from "./modal-footer.component";
import { ModalHeader } from "./modal-header.component";
import ReactDOM from "react-dom";
import styles from "./modal.module.css";

export const Modal = ({ show, title, onClose, body, footer }) => {
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => setIsBrowser(true), []);

  const ModalContent = show ? (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <ModalHeader title={title} onCloseClick={onClose} />
        <ModalBody>{body}</ModalBody>
        {footer && <ModalFooter>{footer}</ModalFooter>}
      </div>
    </div>
  ) : null;

  if (isBrowser) {
    return ReactDOM.createPortal(
      ModalContent,
      document.getElementById("modal-root")
    );
  } else {
    return null;
  }
};
