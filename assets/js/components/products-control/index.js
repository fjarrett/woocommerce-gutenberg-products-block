/**
 * External dependencies
 */
import { __, _n, sprintf } from '@wordpress/i18n';
import { SearchListControl } from '@woocommerce/components';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { withSearchedProducts } from '@woocommerce/block-hocs';
import ErrorMessage from '@woocommerce/block-components/error-placeholder/error-message.js';

/**
 * The products control exposes a custom selector for searching and selecting
 * products.
 *
 * @param {Object} props Component props.
 * @param {Function} props.onChange  Callback fired when the selected item changes
 * @param {Function} props.onSearch  Callback fired when a search is triggered
 * @param {Array}    props.selected  An array of selected products.
 * @param {Array}    props.products  An array of products to select from.
 * @param {boolean}  props.isLoading Whether or not the products are being loaded.
 *
 * @return {Function} A functional component.
 */
const ProductsControl = ( {
	error,
	onChange,
	onSearch,
	selected,
	products,
	isLoading,
} ) => {
	const messages = {
		clear: __( 'Clear all products', 'woo-gutenberg-products-block' ),
		list: __( 'Products', 'woo-gutenberg-products-block' ),
		noItems: __(
			"Your store doesn't have any products.",
			'woo-gutenberg-products-block'
		),
		search: __(
			'Search for products to display',
			'woo-gutenberg-products-block'
		),
		selected: ( n ) =>
			sprintf(
				_n(
					'%d product selected',
					'%d products selected',
					n,
					'woo-gutenberg-products-block'
				),
				n
			),
		updated: __(
			'Product search results updated.',
			'woo-gutenberg-products-block'
		),
	};

	if ( error ) {
		return <ErrorMessage error={ error } />;
	}

	return (
		<SearchListControl
			className="woocommerce-products"
			list={ products }
			isLoading={ isLoading }
			selected={ products.filter( ( { id } ) =>
				selected.includes( id )
			) }
			onSearch={ onSearch }
			onChange={ onChange }
			messages={ messages }
		/>
	);
};

ProductsControl.propTypes = {
	onChange: PropTypes.func.isRequired,
	onSearch: PropTypes.func,
	selected: PropTypes.array,
	products: PropTypes.array,
	isLoading: PropTypes.bool,
};

ProductsControl.defaultProps = {
	selected: [],
	products: [],
	isLoading: true,
};

export default withSearchedProducts( ProductsControl );
