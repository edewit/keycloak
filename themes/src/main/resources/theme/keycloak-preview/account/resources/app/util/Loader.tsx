import * as React from 'react';
import { Spinner } from './Spinner';

export interface LoaderProps<T> {
  loader: () => Promise<T>;
  children: ((arg: T) => React.ReactNode) | React.ReactNode;
}

interface LoaderState<T> {
  readonly data: T | undefined;
  readonly error: string;
}

export class Loader<T> extends React.Component<LoaderProps<T>, LoaderState<T>> {

  constructor(props: LoaderProps<T>) {
    super(props);
    this.state = {
      data: undefined,
      error: ''
    };
  }

  componentDidMount(): void {
    (async () => {
      try {
        const result = await this.props.loader();
        this.setState({ ...this.state, data: result });
      } catch (e) {
        this.setState({ ...this.state, error: e.message });
      }
    })();
  }

  render(): React.ReactNode {
    if (!!this.state.data) {
      if (this.props.children instanceof Function) {
        return this.props.children(this.state.data);
      }
      return this.props.children;
    }
    return (<Spinner error={this.state.error} aria-label="Loading data" />);
  }
}