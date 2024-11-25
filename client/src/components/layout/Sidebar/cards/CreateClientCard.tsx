import { motion } from "framer-motion";
import React from "react";

const CreateClientCard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-4"
    >
      <h2 className="text-lg font-semibold mb-4">Создание карты заказчика</h2>
      {/* Add your client card creation form here */}
    </motion.div>
  );
};

export default CreateClientCard;
