import * as React from 'react';
import styled from 'react-emotion';
import { StyledPaper } from '../styles';
import { CenteredLayout } from '../CenteredLayout';
import bg from '../../bg.svg';

const Div = styled('div')`
  background-image: url(${bg}); 
  background-repeat: no-repeat;
  background-size: cover;
  height: 100vh;
`;

export class Home extends React.Component {
  public render() {
    return (
      <Div>
        <CenteredLayout toppadding={'25px'}>
          <StyledPaper width={'900px'} >
            This is the home page
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla finibus mauris eu orci viverra rutrum. Vivamus id orci quam. Phasellus neque dui, aliquam non est at, facilisis luctus sem. Pellentesque at luctus justo, eget lobortis augue. Etiam ut nibh quis quam blandit auctor. Fusce egestas tortor justo, eu venenatis orci porttitor eu. Fusce quis lacus a nulla pellentesque ullamcorper et posuere erat.

Mauris consectetur euismod fringilla. Suspendisse sapien sapien, imperdiet sed ante eget, commodo laoreet quam. Donec feugiat et neque nec gravida. Suspendisse mattis ornare purus vitae lobortis. Curabitur nec pretium mauris, eget laoreet lectus. Nam sollicitudin ultricies quam in consectetur. Maecenas commodo, felis sed fermentum blandit, purus magna laoreet odio, id porta lorem mi vel dui. Ut facilisis quis velit vitae aliquet. Suspendisse potenti. Donec sit amet arcu nec dolor bibendum maximus. Vestibulum orci turpis, sodales a faucibus non, faucibus ut massa. Donec ultricies ex a leo dapibus ornare. Donec pellentesque egestas nulla eu tristique.

Integer quis dui nisl. Nulla gravida ligula purus, non lacinia risus dictum nec. Nulla ac nibh massa. Curabitur venenatis quis ligula nec vestibulum. Aliquam ornare fermentum sapien, nec tincidunt massa ornare vel. Vestibulum tincidunt luctus rhoncus. Maecenas at hendrerit quam. Praesent fringilla mi at massa finibus, non dapibus ligula pellentesque. Aliquam erat volutpat. Nullam tempus at mi at lacinia. Donec sit amet bibendum libero. Sed eu laoreet nunc, non hendrerit ipsum. Cras vitae nulla ac felis porttitor porta eget nec quam. Integer commodo arcu suscipit mi rhoncus lobortis.
          </StyledPaper>
        </CenteredLayout>
      </Div>
    );
  }
}
