import Tonweb from 'tonweb';

const tonweb = new Tonweb();

export function hexToBase64(hex: string) {
    const bytes = tonweb.utils.hexToBytes(hex);

    return tonweb.utils.bytesToBase64(bytes)
}