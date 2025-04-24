import { useState } from "react";

const useModal = () => {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const toggle = () => {
    setIsOpenModal(!isOpenModal);
  };
  return { isOpenModal, toggle}
};

export default useModal;
