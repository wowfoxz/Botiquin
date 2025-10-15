'use client';

import React from 'react';
import { Cardio } from "ldrs/react";
import 'ldrs/react/Cardio.css'

const CardioLoader: React.FC<{
  size?: string;
  stroke?: string;
  speed?: string;
}> = ({
  size = '70',
  stroke = '5',
  speed = '1'
}) => {
  return (
    <div style={{ display: 'grid', placeContent: 'center' }}>
      <Cardio
        size={parseInt(size)}
        stroke={parseInt(stroke)}
        speed={parseFloat(speed)}
        color="var(--color-info)"
      />
    </div>
  );
};

export default CardioLoader;