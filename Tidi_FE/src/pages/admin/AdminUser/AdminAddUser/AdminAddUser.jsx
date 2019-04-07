// Stylesheet
import React from "react";
import PropTypes from "prop-types";
import "./AdminAddUser.scss";
import { USER_TYPE, USER_GENDER, ACTIVE_TYPE } from "../../../../config/constants";
import FormInput from "../../../common/FormInput";

class AdminAddUser extends React.Component {
    static propTypes = {
        updateForm: PropTypes.func,
        editMode: PropTypes.bool,
        formData: PropTypes.shape({
            username: PropTypes.string,
            permission: PropTypes.oneOf([USER_TYPE.ADMIN, USER_TYPE.PUBLIC, USER_TYPE.CUSTOMER]),
            email: PropTypes.string,
            fullName: PropTypes.string,
            dateOfBirth: PropTypes.string,
            phone: PropTypes.string,
            gender: PropTypes.oneOf([USER_GENDER.MALE, USER_GENDER.FEMALE, ""]),
            address: PropTypes.string,
            active: PropTypes.oneOf([ACTIVE_TYPE.TRUE, ACTIVE_TYPE.FALSE]),
            password: PropTypes.string
        })
    };

    render = () => {
        const { formData, updateForm, editMode } = this.props;
        return (
            <div>
                <form>
                    {/* USERNAME */}
                    <FormInput
                        label="Username"
                        type="text"
                        value={formData.username}
                        onChangeHandler={e =>
                            updateForm({
                                username: e.target.value
                            })
                        }
                    />

                    {/* EMAIL */}
                    <FormInput
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChangeHandler={e =>
                            updateForm({
                                email: e.target.value
                            })
                        }
                    />

                    {/* Password */}
                    {!editMode && (
                        <FormInput
                            label="Password"
                            type="password"
                            value={formData.password}
                            onChangeHandler={e =>
                                updateForm({
                                    password: e.target.value
                                })
                            }
                        />
                    )}

                    {/* Gender */}
                    <FormInput
                        label="Gender"
                        type="select"
                        value={formData.gender}
                        onChangeHandler={e =>
                            updateForm({
                                gender: e.target.value
                            })
                        }
                        options={[USER_GENDER.FEMALE, USER_GENDER.MALE]}
                    />

                    {/* PHONE */}
                    <FormInput
                        label="Phone"
                        type="text"
                        value={formData.phone}
                        onChangeHandler={e =>
                            updateForm({
                                phone: e.target.value
                            })
                        }
                    />

                    {/* FULL NAME */}
                    <FormInput
                        label="Full name"
                        type="text"
                        value={formData.fullName}
                        onChangeHandler={e =>
                            updateForm({
                                fullName: e.target.value
                            })
                        }
                    />

                    {/* Date of Birth */}
                    <FormInput
                        label="Date of Birth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChangeHandler={e =>
                            updateForm({
                                dateOfBirth: e.target.value
                            })
                        }
                    />

                    {/* ADDRESS */}
                    <FormInput
                        label="Address"
                        type="text"
                        value={formData.address}
                        onChangeHandler={e =>
                            updateForm({
                                address: e.target.value
                            })
                        }
                    />

                    {/* Permission */}
                    <FormInput
                        label="Permission"
                        type="select"
                        value={formData.permission}
                        onChangeHandler={e =>
                            updateForm({
                                permission: e.target.value
                            })
                        }
                        options={[USER_TYPE.CUSTOMER, USER_TYPE.ADMIN]}
                    />
                </form>
            </div>
        );
    };
}

export default AdminAddUser;
