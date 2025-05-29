import {ethers} from "ethers";

export function toBytes20(input: string): string {
    let bytes = ethers.toUtf8Bytes(input);

    if (bytes.length > 20) {
        bytes = bytes.slice(0, 20);
    } else if (bytes.length < 20) {
        const padded = new Uint8Array(20);
        padded.set(bytes);
        bytes = padded;
    }

    return ethers.hexlify(bytes);
}