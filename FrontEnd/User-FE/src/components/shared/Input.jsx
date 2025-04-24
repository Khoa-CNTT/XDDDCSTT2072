/* eslint-disable react/prop-types */

const Input = ({ type, placeholder, name, value, onChange, ...rest }) => {
  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}          
      onChange={onChange}
      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      {...rest}
    />
  );
};

export default Input;
