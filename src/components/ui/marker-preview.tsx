// Marker shape previews with luxury styling
export function MarkerPreview({
  shape,
  color,
  size = 'default',
}: {
  shape: string
  color: string
  size?: 'small' | 'default'
}) {
  const dimensions = size === 'small' ? { svg: 28, circle: 22, diamond: 18 } : { svg: 40, circle: 32, diamond: 28 }

  switch (shape) {
    case 'pin':
      return (
        <svg
          width={dimensions.svg}
          height={dimensions.svg}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          style={{ filter: 'drop-shadow(0 0 6px rgba(255, 210, 127, 0.4))' }}
        >
          <path
            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
            fill={color}
            stroke="#F5F0E6"
            strokeWidth="1.5"
          />
          <circle cx="12" cy="9" r="2.5" fill="#F5F0E6" />
        </svg>
      )
    case 'circle':
      return (
        <div
          style={{
            width: dimensions.circle,
            height: dimensions.circle,
            background: color,
            border: '3px solid #F5F0E6',
            borderRadius: '50%',
            boxShadow: `0 0 12px ${color}66, 0 2px 6px rgba(47,79,79,0.15)`,
          }}
        />
      )
    case 'star':
      return (
        <svg
          width={dimensions.svg}
          height={dimensions.svg}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          style={{ filter: 'drop-shadow(0 0 6px rgba(255, 210, 127, 0.4))' }}
        >
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill={color}
            stroke="#F5F0E6"
            strokeWidth="1.5"
          />
        </svg>
      )
    case 'diamond':
      return (
        <div
          style={{
            width: dimensions.diamond,
            height: dimensions.diamond,
            background: color,
            border: '3px solid #F5F0E6',
            transform: 'rotate(45deg)',
            boxShadow: `0 0 12px ${color}66, 0 2px 6px rgba(47,79,79,0.15)`,
            borderRadius: '3px',
          }}
        />
      )
    default:
      return null
  }
}
