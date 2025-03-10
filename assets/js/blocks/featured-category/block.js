/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	AlignmentToolbar,
	BlockControls,
	InnerBlocks,
	InspectorControls,
	MediaUpload,
	MediaUploadCheck,
	PanelColorSettings,
	withColors,
} from '@wordpress/editor';
import {
	Button,
	FocalPointPicker,
	IconButton,
	PanelBody,
	Placeholder,
	RangeControl,
	ResizableBox,
	Spinner,
	ToggleControl,
	Toolbar,
	withSpokenMessages,
} from '@wordpress/components';
import classnames from 'classnames';
import { Fragment } from '@wordpress/element';
import { compose } from '@wordpress/compose';
import PropTypes from 'prop-types';
import { MIN_HEIGHT } from '@woocommerce/block-settings';

/**
 * Internal dependencies
 */
import { IconFolderStar } from '@woocommerce/block-components/icons';
import ProductCategoryControl from '@woocommerce/block-components/product-category-control';
import ErrorPlaceholder from '@woocommerce/block-components/error-placeholder';
import {
	dimRatioToClass,
	getBackgroundImageStyles,
	getCategoryImageId,
	getCategoryImageSrc,
} from './utils';
import { withCategory } from '../../hocs';

/**
 * Component to handle edit mode of "Featured Category".
 */
const FeaturedCategory = ( {
	attributes,
	isSelected,
	setAttributes,
	error,
	getCategory,
	isLoading,
	category,
	overlayColor,
	setOverlayColor,
	debouncedSpeak,
} ) => {
	const renderApiError = () => (
		<ErrorPlaceholder
			className="wc-block-featured-category-error"
			error={ error }
			isLoading={ isLoading }
			onRetry={ getCategory }
		/>
	);

	const getBlockControls = () => {
		const { contentAlign } = attributes;
		const mediaId = attributes.mediaId || getCategoryImageId( category );

		return (
			<BlockControls>
				<AlignmentToolbar
					value={ contentAlign }
					onChange={ ( nextAlign ) => {
						setAttributes( { contentAlign: nextAlign } );
					} }
				/>
				<MediaUploadCheck>
					<Toolbar>
						<MediaUpload
							onSelect={ ( media ) => {
								setAttributes( {
									mediaId: media.id,
									mediaSrc: media.url,
								} );
							} }
							allowedTypes={ [ 'image' ] }
							value={ mediaId }
							render={ ( { open } ) => (
								<IconButton
									className="components-toolbar__control"
									label={ __( 'Edit media' ) }
									icon="format-image"
									onClick={ open }
									disabled={ ! category }
								/>
							) }
						/>
					</Toolbar>
				</MediaUploadCheck>
			</BlockControls>
		);
	};

	const getInspectorControls = () => {
		const url = attributes.mediaSrc || getCategoryImageSrc( category );
		const { focalPoint = { x: 0.5, y: 0.5 } } = attributes;
		// FocalPointPicker was introduced in Gutenberg 5.0 (WordPress 5.2),
		// so we need to check if it exists before using it.
		const focalPointPickerExists = typeof FocalPointPicker === 'function';

		return (
			<InspectorControls key="inspector">
				<PanelBody
					title={ __( 'Content', 'woo-gutenberg-products-block' ) }
				>
					<ToggleControl
						label={ __(
							'Show description',
							'woo-gutenberg-products-block'
						) }
						checked={ attributes.showDesc }
						onChange={ () =>
							setAttributes( { showDesc: ! attributes.showDesc } )
						}
					/>
				</PanelBody>
				<PanelColorSettings
					title={ __( 'Overlay', 'woo-gutenberg-products-block' ) }
					colorSettings={ [
						{
							value: overlayColor.color,
							onChange: setOverlayColor,
							label: __(
								'Overlay Color',
								'woo-gutenberg-products-block'
							),
						},
					] }
				>
					{ !! url && (
						<Fragment>
							<RangeControl
								label={ __(
									'Background Opacity',
									'woo-gutenberg-products-block'
								) }
								value={ attributes.dimRatio }
								onChange={ ( ratio ) =>
									setAttributes( { dimRatio: ratio } )
								}
								min={ 0 }
								max={ 100 }
								step={ 10 }
							/>
							{ focalPointPickerExists && (
								<FocalPointPicker
									label={ __( 'Focal Point Picker' ) }
									url={ url }
									value={ focalPoint }
									onChange={ ( value ) =>
										setAttributes( { focalPoint: value } )
									}
								/>
							) }
						</Fragment>
					) }
				</PanelColorSettings>
			</InspectorControls>
		);
	};

	const renderEditMode = () => {
		const onDone = () => {
			setAttributes( { editMode: false } );
			debouncedSpeak(
				__(
					'Showing Featured Product block preview.',
					'woo-gutenberg-products-block'
				)
			);
		};

		return (
			<Placeholder
				icon={ <IconFolderStar /> }
				label={ __(
					'Featured Category',
					'woo-gutenberg-products-block'
				) }
				className="wc-block-featured-category"
			>
				{ __(
					'Visually highlight a product category and encourage prompt action.',
					'woo-gutenberg-products-block'
				) }
				<div className="wc-block-featured-category__selection">
					<ProductCategoryControl
						selected={ [ attributes.categoryId ] }
						onChange={ ( value = [] ) => {
							const id = value[ 0 ] ? value[ 0 ].id : 0;
							setAttributes( {
								categoryId: id,
								mediaId: 0,
								mediaSrc: '',
							} );
						} }
						isSingle
					/>
					<Button isDefault onClick={ onDone }>
						{ __( 'Done', 'woo-gutenberg-products-block' ) }
					</Button>
				</div>
			</Placeholder>
		);
	};

	const renderCategory = () => {
		const {
			className,
			contentAlign,
			dimRatio,
			focalPoint,
			height,
			showDesc,
		} = attributes;
		const classes = classnames(
			'wc-block-featured-category',
			{
				'is-selected': isSelected,
				'is-loading': ! category && isLoading,
				'is-not-found': ! category && ! isLoading,
				'has-background-dim': dimRatio !== 0,
			},
			dimRatioToClass( dimRatio ),
			contentAlign !== 'center' && `has-${ contentAlign }-content`,
			className
		);
		const mediaSrc = attributes.mediaSrc || getCategoryImageSrc( category );
		const style = !! category ? getBackgroundImageStyles( mediaSrc ) : {};
		if ( overlayColor.color ) {
			style.backgroundColor = overlayColor.color;
		}
		if ( focalPoint ) {
			const bgPosX = focalPoint.x * 100;
			const bgPosY = focalPoint.y * 100;
			style.backgroundPosition = `${ bgPosX }% ${ bgPosY }%`;
		}

		const onResizeStop = ( event, direction, elt ) => {
			setAttributes( { height: parseInt( elt.style.height ) } );
		};

		return (
			<ResizableBox
				className={ classes }
				size={ { height } }
				minHeight={ MIN_HEIGHT }
				enable={ { bottom: true } }
				onResizeStop={ onResizeStop }
				style={ style }
			>
				<div className="wc-block-featured-category__wrapper">
					<h2
						className="wc-block-featured-category__title"
						dangerouslySetInnerHTML={ {
							__html: category.name,
						} }
					/>
					{ showDesc && (
						<div
							className="wc-block-featured-category__description"
							dangerouslySetInnerHTML={ {
								__html: category.description,
							} }
						/>
					) }
					<div className="wc-block-featured-category__link">
						<InnerBlocks
							template={ [
								[
									'core/button',
									{
										text: __(
											'Shop now',
											'woo-gutenberg-products-block'
										),
										url: category.permalink,
										align: 'center',
									},
								],
							] }
							templateLock="all"
						/>
					</div>
				</div>
			</ResizableBox>
		);
	};

	const renderNoCategory = () => (
		<Placeholder
			className="wc-block-featured-category"
			icon={ <IconFolderStar /> }
			label={ __( 'Featured Category', 'woo-gutenberg-products-block' ) }
		>
			{ isLoading ? (
				<Spinner />
			) : (
				__(
					'No product category is selected.',
					'woo-gutenberg-products-block'
				)
			) }
		</Placeholder>
	);

	const { editMode } = attributes;

	if ( error ) {
		return renderApiError();
	}

	if ( editMode ) {
		return renderEditMode();
	}

	return (
		<Fragment>
			{ getBlockControls() }
			{ getInspectorControls() }
			{ category ? renderCategory() : renderNoCategory() }
		</Fragment>
	);
};

FeaturedCategory.propTypes = {
	/**
	 * The attributes for this block.
	 */
	attributes: PropTypes.object.isRequired,
	/**
	 * Whether this block is currently active.
	 */
	isSelected: PropTypes.bool.isRequired,
	/**
	 * The register block name.
	 */
	name: PropTypes.string.isRequired,
	/**
	 * A callback to update attributes.
	 */
	setAttributes: PropTypes.func.isRequired,
	// from withCategory
	error: PropTypes.object,
	getCategory: PropTypes.func,
	isLoading: PropTypes.bool,
	category: PropTypes.shape( {
		name: PropTypes.node,
		description: PropTypes.node,
		permalink: PropTypes.string,
	} ),
	// from withColors
	overlayColor: PropTypes.object,
	setOverlayColor: PropTypes.func.isRequired,
	// from withSpokenMessages
	debouncedSpeak: PropTypes.func.isRequired,
};

export default compose( [
	withCategory,
	withColors( { overlayColor: 'background-color' } ),
	withSpokenMessages,
] )( FeaturedCategory );
