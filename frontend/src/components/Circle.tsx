import * as React from 'react';

interface CircleProps {
  radius: number;
  strokeWidth: number;
  colour?: string;
}

/**
 * Component to draw an SVG circle
 */
export class Circle extends React.PureComponent<CircleProps> {
  constructor(props: CircleProps) {
    super(props);
  }

  public render() {
    const strokeWidth = this.props.strokeWidth || 0;
    const radius = this.props.radius || 0;

    const height = (radius * 2) + 2 * strokeWidth;
    const width = height;

    const cx = radius + (strokeWidth / 2);
    const cy = cx;

    return (
      <svg height={height} width={width} >
        <circle cx={cx} cy={cy} r={radius} fill={this.props.colour || 'black'} />
      </svg>
    );
  }
}
