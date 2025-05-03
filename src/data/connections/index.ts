import type { Connection } from "../../types";

import { k1f } from "./Fakun_Kainji";

const connections: Connection[] = [
    k1f
];

const validConnection = (connection: Connection) => {
    let res = (connection.fromLine && connection.fromStation && connection.toLine && connection.toStation) ? true : false;
    // console.log('valid:', res);
    return res;
}

let validConnections: Connection[] = [];
if(connections.length > 0) {
    // connections.forEach((connection, index) => {
    //     if(!connection.fromLine || !connection.fromStation || !connection.toLine || !connection.toStation) 
    // })
    validConnections = connections.filter(connection => validConnection(connection));
}
// console.log('valid connections', validConnections);

export default validConnections;