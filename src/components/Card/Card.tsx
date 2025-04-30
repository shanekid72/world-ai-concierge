import React from 'react';
import './Card.css';

const Card: React.FC = () => {
  return (
    <div className="card">
      <p className="heading">
        Popular this month
      </p>
      <p>
        Powered By
      </p>
      <p>
        Uiverse
      </p>
    </div>
  );
}

export default Card;
