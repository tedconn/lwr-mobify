import { LightningElement, api } from 'lwc';

/**
 * This comment is important, if it doesn't exist the slot will not be accessible in the ModuleDef,
 * see https://gus.lightning.force.com/lightning/r/0D5B000000moNnZ/view
 * @slot columns container for community_layout-column components
 */
export default class Section extends LightningElement {
    /**
     * sectionConfig is a JSON blob that stores attributes needed for site.com CRUD info (columnKey, Name, columns)
     * AND also attributes that will be passed into the generated column component (columnWidth)
     */
    @api sectionConfig =
        '{"columns":[{"columnKey":"col1","columnName":"Column 1","columnWidth":"12","seedComponents":[]}]}';
}
