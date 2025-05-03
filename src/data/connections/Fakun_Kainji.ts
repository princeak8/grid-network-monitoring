import type { Connection, Station, Line } from "../../types";
import Fakun from "../stations/Fakun";
import Kainji from "../stations/Kainji";

const getLine = (id:string, lines:Line[]) => {
    // console.log('lines:', lines);
    // console.log('id:', id);
    if(lines.length == 0) {
        console.log('null1');
        return null;
    }
    let lineArr = lines.filter( line => line.id == id );
    // console.log('lineArr', lineArr);
    return (lineArr.length > 0) ? lineArr[0] : null;
}

const k1fConn = 'k1f';

export const k1f = {
    id: k1fConn,
    fromStation: Fakun,
    fromLine: getLine(k1fConn, Fakun.lines),
    fromSide: 'right',
    toStation: Kainji,
    toLine: getLine(k1fConn, Kainji.lines),
    toSide: 'left',
    color: '#3498db',
    strokeWidth: 3
  }
