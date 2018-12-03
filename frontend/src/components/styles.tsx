import styled from 'react-emotion';
import { SFC } from 'react';
import Paper, { PaperProps } from '@material-ui/core/Paper';
import * as React from 'react';
import TextField, { TextFieldProps } from '@material-ui/core/TextField';
import Checkbox, { CheckboxProps } from '@material-ui/core/Checkbox';
import ListItem, { ListItemProps } from '@material-ui/core/ListItem';
import ListItemText, { ListItemTextProps } from '@material-ui/core/ListItemText';
import bg from '../bg.svg';

const phoneMQ = '@media (min-width: 320px) and (max-width: 480px)';

const ListItemTextS: SFC<ListItemTextProps> = ({
  className,
  ...passedProps
}) => (<ListItemText className={className} {...passedProps} />);

export const StyledListItemText = styled(ListItemTextS)`
  padding-left: 5px;
  padding-right: 5px;
  text-decoration: ${
    (props: { strikethrough?: boolean }) => props.strikethrough ? 'line-through' : undefined
  };
`;

const ListItemS: SFC<ListItemProps> = ({
  children,
  className,
  ...props
}) => (<ListItem className={className} {...props}>{children}</ListItem>);

export const StyledListItem = styled(ListItem)`
  padding-left: 0px;
  padding-right: 0px;
  border-bottom: 1px solid grey;
`;

const ListItemCheckboxS: SFC<CheckboxProps> = ({
  className,
  ...props
}) => (<Checkbox className={className} {...props} />);

export const StyledListItemCheckbox = styled(ListItemCheckboxS)`
  padding-left: 5px;
  padding-right: 5px;
`;

const PaperS: SFC<PaperProps> = ({
  children,
  className,
  ...props
}) => (<Paper className={className} {...props}>{children}</Paper>);

interface StyledPaperProps {
  width?: string;
}

export const StyledPaper = styled(PaperS)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 25px;
  width: 470px;
  ${(props: StyledPaperProps) => 'width: ' + props.width + ';' || '470px;'} 
  ${phoneMQ} {
    width: 100%;
  }
`;

const TextFieldS: SFC<TextFieldProps> = ({
  className,
  ...props
}) => (<TextField className={className} fullWidth={true} {...props} />);

export const StyledTextField = styled(TextFieldS)`
  max-width: 470px;
  margin-bottom: 15px;
`;

export const Form = styled('form')`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

export const Input = styled('input')`
  max-width: 350px;
  height: 30px;
  margin-bottom: 10px;
  padding: 5px;
`;

export const ModalContent = styled('div')`
  position: absolute;
  background-color: white;
  box-shadow: 5px;
  padding: 5px;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`;

export const BGDiv = styled('div')`
  background-image: url(${bg}); 
  background-repeat: no-repeat;
  background-size: cover;
  flex: 1 1 auto;
`;
