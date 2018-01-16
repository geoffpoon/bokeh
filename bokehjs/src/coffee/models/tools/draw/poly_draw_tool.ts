import * as p from "core/properties"
import {SelectTool} from "../gestures/select_tool"
import {EditToolView} from "./edit_tool"
import {ColumnDataSource} from "../../sources/column_data_source"


export interface BkEv {
  bokeh: {
    sx: number
    sy: number
  }
  srcEvent: {
    shiftKey?: boolean
  }
  keyCode: number
  timeStamp: number
}


export class PolyDrawToolView extends EditToolView {
  model: PolyDrawTool

  _tap(e: BkEv): void {
    const append = e.srcEvent.shiftKey != null ? e.srcEvent.shiftKey : false;
    this._select_event(e, append);
  }

  _keyup(e: BkEv): void {
    if ((e.keyCode === 8) && this.model.active) {
      const ds = this.model.source;
      const indices = ds.selected['1d'].indices;
      indices.sort();
      for (let index = 0; index < indices.length; index++) {
        const ind = indices[index];
        ds.data[this.model.x].splice(ind-index, 1);
        ds.data[this.model.y].splice(ind-index, 1);
      }
      ds.selected['1d'].indices = [];
      ds.change.emit(undefined);
      ds.properties.data.change.emit(undefined);
      ds.properties.selected.change.emit(undefined);
    }
  }

  _pan_start(e: BkEv): void {
    const point = this._map_drag(e.bokeh.sx, e.bokeh.sy);
    if (point == null) {
      return;
    }
    const [x, y] = point;
    const append = e.srcEvent.shiftKey != null ? e.srcEvent.shiftKey : false;
    const ds = this.model.source;
    const indices = ds.selected['1d'].indices;
    let count;
    if (indices.length>0) {
      count = indices[0];
    } else {
      count = ds.data[this.model.x].length-1;
    }
    if (append && (count >= 0)) {
      ds.data[this.model.x][count].push(x);
      ds.data[this.model.y][count].push(y);
    } else {
      ds.data[this.model.x].push([x, x]);
      ds.data[this.model.y].push([y, y]);
    }
    ds.change.emit(undefined);
    ds.properties.data.change.emit(undefined);
  }

  _pan(e: BkEv): void {
    const point = this._map_drag(e.bokeh.sx, e.bokeh.sy);
    if (point == null) {
      return;
    }
    const [x, y] = point;

    const ds = this.model.source;
    const indices = ds.selected['1d'].indices;
    let count;
    if (indices.length>0) {
      count = indices[0];
    } else {
      count = ds.data[this.model.x].length-1;
    }
    const xs = ds.data[this.model.x][count];
    const ys = ds.data[this.model.y][count];
    xs[xs.length-1] = x;
    ys[ys.length-1] = y;
    ds.change.emit(undefined);
    ds.properties.data.change.emit(undefined);
  }
}


export class PolyDrawTool extends SelectTool {
  source: ColumnDataSource
  x: string
  y: string

  tool_name = "Polygon Draw Tool"
  icon = "bk-tool-icon-polygon-draw"
  event_type = ["pan", "tap"]
  default_order = 12
}

PolyDrawTool.prototype.type = "PolyDrawTool"

PolyDrawTool.prototype.default_view = PolyDrawToolView

PolyDrawTool.define({
  source: [ p.Instance ],
  x:      [ p.String, 'x' ],
  y:      [ p.String, 'y' ]
})