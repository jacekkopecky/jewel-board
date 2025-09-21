/**
 * ...docs go here...
 * @param e
 * @param page
 * @returns
 */
export function pointFrom(e, page = false) {
    const touch = e.touches[0];
    return {
        x: page ? touch.pageX : touch.clientX,
        y: page ? touch.pageY : touch.clientY,
    };
}
/**
 * ...docs go here...
 * @param dst
 * @param src
 * @param props
 */
export function copyProps(dst, src, props) {
    for (let i = 0; i < props.length; i++) {
        let p = props[i];
        dst[p] = src[p];
    }
}
/**
 * ...docs go here...
 * @param type
 * @param srcEvent
 * @param target
 * @returns
 */
export function newForwardableEvent(type, srcEvent, target) {
    const _kbdProps = ["altKey", "ctrlKey", "metaKey", "shiftKey"];
    const _ptProps = [
        "pageX",
        "pageY",
        "clientX",
        "clientY",
        "screenX",
        "screenY",
        "offsetX",
        "offsetY",
    ];
    const evt = new Event(type, {
        bubbles: true,
        cancelable: true,
    }), touch = srcEvent.touches[0];
    evt.button = 0;
    evt.which = evt.buttons = 1;
    copyProps(evt, srcEvent, _kbdProps);
    copyProps(evt, touch, _ptProps);
    setOffsetAndLayerProps(evt, target);
    return evt;
}
/**
 * ...docs go here...
 * @param e
 * @param target
 */
function setOffsetAndLayerProps(e, target) {
    const rect = target.getBoundingClientRect();
    if (e.offsetX === undefined) {
        e.offsetX = e.clientX - rect.x;
        e.offsetY = e.clientY - rect.y;
    }
    if (e.layerX === undefined) {
        e.layerX = e.pageX - rect.left;
        e.layerY = e.pageY - rect.top;
    }
}
/**
 * ...docs go here...
 * @param src
 * @param dst
 */
export function copyStyle(src, dst) {
    // remove potentially troublesome attributes
    removeTroublesomeAttributes(dst);
    // copy canvas content
    if (src instanceof HTMLCanvasElement) {
        let cDst = dst;
        cDst.width = src.width;
        cDst.height = src.height;
        cDst.getContext("2d").drawImage(src, 0, 0);
    }
    // copy style (without transitions)
    copyComputedStyles(src, dst);
    dst.style.pointerEvents = "none";
    // and repeat for all children
    for (let i = 0; i < src.children.length; i++) {
        copyStyle(src.children[i], dst.children[i]);
    }
}
/**
 * ...docs go here...
 * @param src
 * @param dst
 * @param copyKey
 */
function copyComputedStyles(src, dst) {
    let cs = getComputedStyle(src);
    for (let key of cs) {
        if (key.includes("transition"))
            continue;
        dst.style[key] = cs[key];
    }
    Object.keys(dst.dataset).forEach((key) => delete dst.dataset[key]);
}
/**
 * ...docs go here...
 * @param dst
 */
function removeTroublesomeAttributes(dst) {
    ["id", "class", "style", "draggable"].forEach(function (att) {
        dst.removeAttribute(att);
    });
}
