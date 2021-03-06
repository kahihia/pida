import React from "react"
import { getProduct, orderTester } from "../../../api"
import Loader from "../../../components/Loader"
import ProductListPresenter from "./ProductListPresenter"
import PaletteSelect from "./PaletteSelect"
import {
  loadPalette,
  paletteSelect,
  initializePalette,
  add2palette,
  removeTester
} from "../../../utils"
import PaletteModal from "./components/PaletteModal"
import Detail from "../../Detail"
import Notice from "../../../components/Notice"
import Complete from "../../../components/Complete"

export default class extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam("name")
    }
  }
  constructor(props) {
    super(props)
    const {
      navigation: {
        state: {
          params: { products }
        }
      }
    } = props
    this.state = {
      urls: products,
      products: [],
      loading: true,
      palette: {},
      product: {},
      navigation: props.navigation,
      modalVisible: false,
      detailVisible: false,
      paletteSelectVisible: false,
      completeVisible: false
    }
  }

  async componentDidMount() {
    let products, palette
    try {
      products = await this._loadProducts()
      palette = await loadPalette()
    } catch {
    } finally {
      let paletteSelectVisible = false
      if (Object.keys(palette).length === 0 || palette.size === -1)
        paletteSelectVisible = true
      this.setState({
        loading: false,
        products,
        palette: palette || {},
        paletteSelectVisible
      })
    }
  }

  _closePalette = () => {
    //결제모듈 띄우기
    this.setState({
      modalVisible: false,
      completeVisible: true
    })
  }

  _closeComplete = () => {
    this.setState({
      completeVisible: false
    })
  }

  _orderComplete = () => {
    initializePalette()
    this.setState({
      //palette: { size: -1, selected: [] },
      //paletteSelectVisible: true,
      completeVisible: false
    })
  }

  _loadProducts = async () => {
    const { urls } = this.state
    let products = []
    try {
      for (let i = 0; i < urls.length; i++) {
        let json = await getProduct(urls[i])
        products.push(json)
      }
      return products
    } catch (error) {
      console.log(error)
    }
  }

  _select = size => {
    paletteSelect(size)
    const palette = {
      size: size,
      selected: []
    }
    this.setState({ palette, paletteSelectVisible: false })
  }

  _selectCancel = () => {
    const { goBack } = this.props.navigation
    goBack()
  }

  _removeTester = id => {
    const { palette } = this.state
    const newPallete = removeTester(id, palette)
    this.setState({ palette: newPallete })
  }

  _openModal = () => {
    this.setState({ modalVisible: true })
  }

  _closeModal = () => {
    this.setState({ modalVisible: false })
  }

  _openDetail = product => {
    this.setState({ detailVisible: true, product })
  }

  _closeDetail = () => {
    this.setState({ detailVisible: false })
  }

  _addTester = async product => {
    try {
      const newPalette = await add2palette(product)
      this.setState({ palette: newPalette })
    } catch (error) {
      console.log(error)
    }
  }

  render() {
    const {
      loading,
      products,
      navigation,
      palette,
      modalVisible,
      product,
      detailVisible,
      paletteSelectVisible,
      completeVisible
    } = this.state
    if (loading) return <Loader />
    else if (products.length === 0)
      return <Notice text="상품을 준비중입니다." />
    else {
      return (
        <>
          {paletteSelectVisible ? (
            <PaletteSelect
              _select={this._select}
              visible={paletteSelectVisible}
              _selectCancel={this._selectCancel}
            />
          ) : (
            <>
              <ProductListPresenter
                products={products}
                palette={palette}
                navigation={navigation}
                _openModal={this._openModal}
                _openDetail={this._openDetail}
              />
            </>
          )}
          {detailVisible ? (
            <Detail
              visible={detailVisible}
              product={product}
              tab="category"
              _closeDetail={this._closeDetail}
              _addTester={this._addTester}
            />
          ) : null}
          {modalVisible ? (
            <PaletteModal
              visible={modalVisible}
              _closeModal={this._closeModal}
              palette={palette}
              _removeTester={this._removeTester}
              _closePalette={this._closePalette}
            />
          ) : null}

          <Complete
            from="palette"
            visible={completeVisible}
            _closeComplete={this._closeComplete}
            _orderComplete={this._orderComplete}
            start="Category"
          />
        </>
      )
    }
  }
}
