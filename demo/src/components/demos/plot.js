import React, {Component} from 'react';
import autobind from 'autobind-decorator';
import {Parser} from 'expr-eval';

import OrbitController from '../orbit-controller';
import PlotLayer from '../../../../examples/sample-layers/plot-layer';
import DeckGL from 'deck.gl';

export default class PlotDemo extends Component {

  static get data() {
    return [];
  }

  static get parameters() {
    return {
      equation: {displayName: 'Z = f(x, y)', type: 'text', value: 'sin(x ^ 2 + y ^ 2) * x / 3.14'},
      resolution: {displayName: 'Resolution', type: 'number',
        value: 200, step: 10, min: 10, max: 1000},
      showAxis: {displayName: 'Grid', type: 'checkbox', value: true}
    };
  }

  static get viewport() {
    return null;
  }

  static renderInfo(meta) {
    return (
      <div>
        <h3>Graph Explorer</h3>
        <p>Non-geospatial demo.</p>
      </div>
    );
  }

  constructor(props) {
    super(props);

    this.state = {
      viewport: {
        lookAt: [0, 0, 0],
        distance: 5,
        rotationX: -30,
        rotationY: 30,
        fov: 50,
        minDistance: 2,
        maxDistance: 20
      },
      equation: {},
      hoverInfo: null
    };
  }

  componentDidMount() {
    this.refs.canvas.fitBounds([-1, -1, -1], [1, 1, 1]);
  }

  componentWillReceiveProps(nextProps) {
    const {equation} = nextProps.params;
    if (equation && equation !== this.props.params.equation) {
      const expression = equation.value;
      try {
        const p = Parser.parse(expression);
        this.setState({
          equation: {
            valid: true,
            func: (x, y) => p.evaluate({x, y}),
            text: p.toString()
          }
        });
      } catch (err) {
        this.setState({
          equation: {valid: false}
        });
      }
    }
  }

  @autobind _onHover(info) {
    const hoverInfo = info.sample ? info : null;
    if (hoverInfo !== this.state.hoverInfo) {
      this.setState({hoverInfo});
    }
  }

  @autobind _onViewportChange(viewport) {
    this.setState({
      viewport: {...this.state.viewport, ...viewport}
    });
  }

  _onInitialized(gl) {
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
  }

  render() {
    const {
      viewport: {width, height},
      params: {resolution, showAxis}
    } = this.props;
    const {viewport, equation, hoverInfo} = this.state;

    const layers = equation.valid ? [
      new PlotLayer({
        getZ: equation.func,
        getColor: (x, y, z) => [40, z * 128 + 128, 160],
        xMin: -Math.PI,
        xMax: Math.PI,
        yMin: -Math.PI,
        yMax: Math.PI,
        xResolution: resolution.value,
        yResolution: resolution.value,
        drawAxes: showAxis.value,
        axesOffset: 0.25,
        axesColor: [0, 0, 0, 128],
        opacity: 1,
        pickable: true,
        onHover: this._onHover,
        updateTriggers: {
          getZ: equation.text
        }
      })
    ] : [];

    const canvasProps = {
      width,
      height,
      ...viewport
    };
    const perspectiveViewport = OrbitController.getViewport(canvasProps);

    return (
      <OrbitController ref="canvas"
        {...canvasProps}
        onViewportChange={this._onViewportChange} >
        <DeckGL
          onWebGLInitialized={this._onInitialized}
          width={width}
          height={height}
          viewport={perspectiveViewport}
          layers={ layers } />

        {hoverInfo && <div className="tooltip" style={{left: hoverInfo.x, top: hoverInfo.y}} >
          { hoverInfo.sample.map(x => x.toFixed(3)).join(', ') }
          </div>}

      </OrbitController>
    );
  }
}
