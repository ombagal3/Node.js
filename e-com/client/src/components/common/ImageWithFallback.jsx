import React, { useState } from 'react';

const FALLBACK_SVG = "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22600%22%20height%3D%22600%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20600%20600%22%20fill%3D%22%23F3EFEA%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23F3EFEA%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20fill%3D%22%23A1A1AA%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3EVERVE%20ATELIER%20OBJECT%3C%2Ftext%3E%3C%2Fsvg%3E";

export default function ImageWithFallback({ src, alt, className = '', style = {}, ...props }) {
  const [imgSrc, setImgSrc] = useState(src || FALLBACK_SVG);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(FALLBACK_SVG);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt || 'Product image'}
      className={className}
      style={style}
      onError={handleError}
      loading="lazy"
      {...props}
    />
  );
}
