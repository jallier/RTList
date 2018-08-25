import * as styled from './styled-components';

export const PaperStyle = {
  // 'background-color': 'red',
  'width': '60%',
  'padding': '30px',
  'display': 'flex',
  'flex-direction': 'column',
  'justify-content': 'center',
  'align-items': 'center'
};

export const Input = styled.default.input`
      width: 350px;
      height: 30px;
      margin-bottom: 10px;
      padding: 5px;
    `;

export const ModalContent = styled.default.div`
  position: absolute;
  backgroundColor: white;
  boxShadow: 5px;
  padding: 5px;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`;