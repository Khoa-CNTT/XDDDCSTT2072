/* eslint-disable react/prop-types */

const Input = ({ type, placeholder, ...rest }) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
      {...rest}
    />
  );
};

export default Input;
