/**
 * External dependencies
 */
import { render } from 'react-dom';

/**
 * Renders a block component in the place of a specified set of selectors.
 *
 * @param {string}   selector   CSS selector to match the elements to replace.
 * @param {function} Block      React block to use as a replacement.
 * @param {function} [getProps] Function to generate the props object for the
 * block.
 */
export default ( selector, Block, getProps = () => {} ) => {
	const containers = document.querySelectorAll( selector );

	if ( containers.length ) {
		// Use Array.forEach for IE11 compatibility
		Array.prototype.forEach.call( containers, ( el ) => {
			const props = getProps( el );
			const attributes = {
				...el.dataset,
				...props.attributes,
			};

			el.classList.remove( 'is-loading' );

			render( <Block { ...props } attributes={ attributes } />, el );
		} );
	}
};
