import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import PDFDragAndDrop from './PDFDragAndDrop';

function PrepareContainer() {
    return (
        <DndProvider backend={HTML5Backend}>
            <PDFDragAndDrop />
        </DndProvider>
    );
}

export default PrepareContainer;
