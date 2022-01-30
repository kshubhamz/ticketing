export const Alert = ({ classBinding, children }) => {
  return (
    <div style={{ marginTop: "10px" }} className={`alert ${classBinding}`}>
      {children}
    </div>
  );
};
