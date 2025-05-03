export interface Line {
    tableId?: number;
    id: string;
    name?: string;
    mw?: number | null;
    v?: number | null;
    x: number;  // Keep for positioning within station
    y: number;  // Keep for positioning within station
    outgoingConnections?: Connection[];
    incomingConnections?: Connection[];
  }
  
export  interface Station {
    tableId?: number;
    id: string;
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    lines: Line[];
}

export interface ApiStation {
    tableId?: number;
    identifier: string;
    name: string;
    x: number;
    y: number;
    display?: boolean;
    lines?: Line[];
}
  
export  interface Connection {
    id: string;
    fromStation: Station | null;
    fromLine: Line | null;
    fromSide: string;
    toStation: Station | null;
    toLine: Line | null;
    toSide: string;
    color: string;
    strokeWidth: number;
}


export interface Role {
    id: number,
    name: string
}

export interface UserType {
    name: string,
    email: string,
    lastLogin?: Date,
    role: Role
}

