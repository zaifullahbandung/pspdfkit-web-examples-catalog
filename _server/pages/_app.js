import React from "react";
import App, { Container } from "next/app";
import Layout from "../components/layout";
import Router from "next/router";

import { getInitialBackend } from "../components/example/utils";

export default class MyApp extends App {
  state = {
    // Either "standalone" or "server", depending if we want to open a PDF
    // locally or via PSPDFKit Server
    currentBackend: null,
    // The current example is one of our existing examples and contains a string
    // with the name of the example, like "hello" or "annotations". It could
    // also be "custom" for custom examples.
    currentExample: null,
    // Used to store the Blob of custom standalone examples or the shareable ID
    // when PSPDFKit Server gets used.
    customPdf: null,
    // Indicates if we're currently uploading a custom PDF
    isUploading: false
  };

  componentDidMount() {
    const currentExample = this.props.router.pathname.split("/")[1];
    this.setState({
      currentBackend: getInitialBackend(),
      currentExample,
      customPdf: currentExample === "custom" && this.props.router.query.i
    });
  }

  _switchExample = nextExample => {
    this.setState({
      currentExample: nextExample
    });
    Router.push(`/${nextExample}`);
  };

  _switchBackend = nextBackend => {
    this.setState({
      currentBackend: nextBackend
    });
  };

  _showCustomPdf = customPdf => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(customPdf);
    reader.addEventListener("load", event => {
      this.setState(
        { customPdf: event.target.result, currentExample: "custom" },
        () => {
          Router.push("/custom");
        }
      );
    });
  };

  _uploadCustomPdf = async customPdf => {
    this.setState({ isUploading: true });
    let form = new FormData();
    form.append("file", customPdf, customPdf.name);
    const response = await fetch(`/api/upload`, {
      method: "POST",
      body: form,
      credentials: "same-origin"
    }).then(res => res.json());

    if (!response.error) {
      this.setState(
        {
          currentBackend: "server",
          currentExample: "custom",
          isUploading: false,
          customPdf: response.id
        },
        () => {
          Router.push({
            pathname: "/custom",
            query: {
              i: response.id
            }
          });
        }
      );
    } else {
      // When an error happened during upload, we just reset the state and redirect
      // to the initial example
      console.error(response.error);
      this.setState(
        {
          currentBackend: null,
          currentExample: null,
          isUploading: false,
          customPdf: null
        },
        () => {
          Router.push({
            pathname: "/"
          });
        }
      );
      Router.push("/");
    }
  };

  render() {
    const { Component } = this.props;
    const { currentBackend, currentExample, customPdf } = this.state;

    // Wait until we have determined the backend.
    // @TODO improve this in the future and show everything from the UI that is possible to show upfront
    if (!currentBackend) {
      return null;
    }

    return (
      <Container>
        <Layout
          currentBackend={currentBackend}
          switchBackend={this._switchBackend}
          currentExample={currentExample}
          switchExample={this._switchExample}
          showCustomPdf={this._showCustomPdf}
          serverDocumentId={this.props.router.query.i}
        >
          <Component
            currentBackend={currentBackend}
            currentExample={currentExample}
            customPdf={customPdf}
            showCustomPdf={this._showCustomPdf}
            uploadCustomPdf={this._uploadCustomPdf}
            isUploading={this.state.isUploading}
          />
        </Layout>
      </Container>
    );
  }
}
