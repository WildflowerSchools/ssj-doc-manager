import React from "react"
import ReactModal from "react-modal"
import PropTypes from "prop-types"

import CopyDocumentsForm from "./form"

const customStyles = {
  content: {
    position: "absolute",
    top: "5px",
    left: "5px",
    right: "5px",
    bottom: "5px",
    maxWidth: "500px",
    margin: "auto",
    height: "400px",
    overflow: "visible"
  }
}

const closeButtonStyle = {
  top: "-10px",
  right: "-10px",
  position: "absolute"
}

class CreateModal extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isOpen: props.isOpen,
      templates: props.templates
    }

    this.onRequestClose = props.onRequestClose

    this.openModal = this.openModal.bind(this)
    this.afterOpenModal = this.afterOpenModal.bind(this)
    this.closeModal = this.closeModal.bind(this)
  }

  openModal() {
    this.setState({ isOpen: true })
  }

  afterOpenModal() {}

  closeModal() {
    this.onRequestClose()
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.isOpen !== prevState.isOpen) {
      return { isOpen: nextProps.isOpen }
    } else {
      return null
    }
  }

  render() {
    return (
      <ReactModal
        isOpen={this.state.isOpen}
        onAfterOpen={this.afterOpenModal}
        onRequestClose={this.closeModal}
        style={customStyles}
        contentLabel="Example Modal"
      >
        <button
          style={closeButtonStyle}
          onClick={this.closeModal}
          className="close-button"
          data-close
          aria-label="Close modal"
          type="button"
        >
          <span aria-hidden="true">&times;</span>
        </button>

        <h3>Select Schools and Teachers to Create Copies</h3>
        <CopyDocumentsForm
          templates={this.state.templates}
          onSuccess={this.closeModal}
          onFailure={this.closeModal}
        />
      </ReactModal>
    )
  }
}

CreateModal.propTypes = {
  templates: PropTypes.array,
  onRequestClose: PropTypes.func,
  isOpen: PropTypes.bool
}

export default CreateModal
