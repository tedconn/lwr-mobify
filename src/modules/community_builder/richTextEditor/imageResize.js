import { imageButtonClickHandler } from './toolbarHandlers';
import { getSelectionRangeForNode, expandSelectionToNode } from './toolbarUtil';
/**
 * Custom module for quilljs to allow user to resize <img> elements
 */

const RESIZE_HANDLE_WIDTH = 12;
const RESIZE_HANDLE_HEIGHT = 12;
const CURSORS = [
    'nwse-resize', // top left
    'nesw-resize', // top right
    'nwse-resize', // bottom right
    'nesw-resize' // bottom left
];

export default class ImageResize {
    constructor(quill, options = {}) {
        // save the quill reference and options
        this.quill = quill;

        // respond to clicks inside the editor
        this.quill.root.addEventListener('click', this.handleClick, false);
        this.connection = options.connection;
        this.img = null;
    }

    handleClick = (evt) => {
        if (
            evt.target &&
            evt.target.tagName &&
            evt.target.tagName.toUpperCase() === 'IMG'
        ) {
            if (this.img === evt.target) {
                // we are already focused on this image
                return;
            }
            if (this.img) {
                // we were just focused on another image
                this.hide();
            }
            // clicked on an image inside the editor
            this.show(evt.target);
        } else if (this.img) {
            // clicked on a non image
            this.hide();
        }
    };

    selectImage = () => {
        expandSelectionToNode(this.quill, this.img);
    };

    show = (img) => {
        // keep track of this img element
        this.img = img;

        this.showOverlay();

        this.initializeResize();

        // select the new image
        this.selectImage();
    };

    showOverlay = () => {
        if (this.overlay) {
            this.hideOverlay();
        }

        // listen for the image being deleted or moved
        document.addEventListener('keyup', this.checkImage, true);
        this.quill.root.addEventListener('input', this.checkImage, true);

        // Create and add the overlay
        this.overlay = document.createElement('div');
        this.overlay.classList.add('ql-image-resize-overlay');

        this.quill.root.parentNode.appendChild(this.overlay);
        this.overlay.addEventListener(
            'dblclick',
            this.handleOverlayDblClick,
            false
        );
        this.overlay.addEventListener('click', this.selectImage);
    };

    hideOverlay = () => {
        if (!this.overlay) {
            return;
        }

        // Remove the overlay
        this.overlay.removeEventListener(
            'dblclick',
            this.handleOverlayDblClick
        );
        this.overlay.removeEventListener('click', this.selectImage);
        this.quill.root.parentNode.removeChild(this.overlay);
        this.overlay = undefined;

        // stop listening for image deletion or movement
        document.removeEventListener('keyup', this.checkImage);
        this.quill.root.removeEventListener('input', this.checkImage);
    };

    initializeResize = () => {
        this.createAndPositionBoxes();
        this.repositionElements();
    };

    createAndPositionBoxes = () => {
        // track resize handles
        this.boxes = [];
        // add 4 resize handles
        this.boxes = CURSORS.map((cursor) => this.createBox(cursor));
        this.boxes.forEach((box) => this.overlay.appendChild(box));

        this.positionBoxes();
    };

    positionBoxes = () => {
        const handleXOffset = `${-parseFloat(RESIZE_HANDLE_WIDTH) / 2}px`;
        const handleYOffset = `${-parseFloat(RESIZE_HANDLE_HEIGHT) / 2}px`;

        // set the top and left for each drag handle
        [
            `left: ${handleXOffset};top: ${handleYOffset};`, // top left
            `right: ${handleXOffset};top: ${handleYOffset};`, // top right
            `right: ${handleXOffset};bottom: ${handleYOffset};`, // bottom right
            `left: ${handleXOffset};bottom: ${handleYOffset};` // bottom left
        ].forEach((pos, index) => {
            let existingStyle = this.boxes[index].getAttribute('style');
            this.boxes[index].setAttribute('style', existingStyle + pos);
        });
    };

    createBox = (cursor) => {
        // create div element for resize handle
        const box = document.createElement('div');

        // Star with the specified styles
        box.classList.add('ql-image-resize-handle');
        box.setAttribute('style', `cursor:${cursor};`);

        // listen for mousedown on each box
        box.addEventListener('mousedown', this.handleMousedown, false);
        return box;
    };

    handleMousedown = (evt) => {
        // note which box
        this.dragBox = evt.target;
        // note starting mousedown position
        this.dragStartX = evt.clientX;
        // store the width before the drag
        this.preDragWidth = this.img.width;
        // set the proper cursor everywhere
        this.setCursor(this.dragBox.style.cursor);
        // listen for movement and mouseup
        document.addEventListener('mousemove', this.handleDrag, false);
        document.addEventListener('mouseup', this.handleMouseup, false);
    };

    handleMouseup = () => {
        // reset cursor everywhere
        this.setCursor('');

        // select the image after mouse is released
        this.selectImage();

        // stop listening for movement and mouseup
        document.removeEventListener('mousemove', this.handleDrag);
        document.removeEventListener('mouseup', this.handleMouseup);
    };

    handleDrag = (evt) => {
        if (!this.img) {
            // image not set yet
            return;
        }
        // update image size
        const deltaX = evt.clientX - this.dragStartX;
        if (this.dragBox === this.boxes[0] || this.dragBox === this.boxes[3]) {
            // left-side resize handler; dragging right shrinks image
            this.img.width = Math.round(this.preDragWidth - deltaX);
        } else {
            // right-side resize handler; dragging right enlarges image
            this.img.width = Math.round(this.preDragWidth + deltaX);
        }
        this.repositionElements();
    };

    setCursor = (value) => {
        [document.body, this.img].forEach((el) => {
            el.style.cursor = value;
        });
    };

    repositionElements = () => {
        // position the overlay over the image
        const parent = this.quill.root.parentNode;
        const imgRect = this.img.getBoundingClientRect();
        const containerRect = parent.getBoundingClientRect();

        this.overlay.setAttribute(
            'style',
            `left: ${
                imgRect.left - containerRect.left - 1 + parent.scrollLeft
            }px; top: ${
                imgRect.top - containerRect.top + parent.scrollTop
            }px; width: ${imgRect.width}px;height: ${imgRect.height}px;`
        );
    };

    hide = () => {
        this.hideOverlay();
        this.img = undefined;
    };

    checkImage = (evt) => {
        if (this.img) {
            if (evt.keyCode === 46 || evt.keyCode === 8) {
                this.quill.constructor.find(this.img).deleteAt(0);
            }
            this.hide();
        }
    };
    handleOverlayDblClick = () => {
        let selectionRange = getSelectionRangeForNode(this.quill, this.img);
        imageButtonClickHandler(this.quill, this.connection, selectionRange);
        // hide the overlay as we may need to reposition based on the new image selected.
        this.hide();
    };
}
