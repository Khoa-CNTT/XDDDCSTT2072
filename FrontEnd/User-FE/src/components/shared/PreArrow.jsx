/* eslint-disable react/prop-types */
const PreArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      style={{ ...style, display: "block", background: "black", borderRadius: "50%", }}
      onClick={onClick}
    />
  );
};

export default PreArrow;
