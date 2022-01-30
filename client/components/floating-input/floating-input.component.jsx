const FloatingInput = ({
  type,
  label,
  id,
  placeholder,
  onChange,
  classBinding,
  ...otherProps
}) => {
  return (
    <div className={`form-floating ${classBinding ? classBinding : ""}`}>
      <input
        type={type}
        className="form-control"
        id={id}
        placeholder={placeholder}
        onChange={onChange}
        {...otherProps}
      />
      <label htmlFor={id}>{label}</label>
    </div>
  );
};

export { FloatingInput };
