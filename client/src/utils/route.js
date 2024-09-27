export const route = {
    sudo: {
        fetch: 'super-admin/get-super-admin',
        edit: 'super-admin/edit-super-admin',
        password: 'super-admin/change-password',
        picture: 'super-admin/update-profile-picture',
        editAdmin: 'super-admin/edit-admin',
    },
    admin: {
        fetch: 'adminSLP/get-admin',
        edit: 'adminSLP/edit-admin',
        password: 'adminSLP/change-password',
        picture: 'adminSLP/update-profile-picture',
        editClinician: 'adminSLP/edit-clinician',
        editPatient: 'adminSLP/edit-patient',
    },
    clinician: {
        fetch: 'clinicianSLP/get-clinician',
        edit: 'clinicianSLP/edit-clinician',
        password: 'clinicianSLP/change-password',
        picture: 'clinicianSLP/update-profile-picture',
    },
    patient: {
        fetch: 'patient-SLP/get-patient',
        edit: 'patient-SLP/edit-patient',
        password: 'patient-SLP/change-password',
        picture: 'patient-SLP/update-profile-picture',
    },
    system: {
        login: 'super-admin/super-admin-login',
        signup: 'super-admin-signup',
        forgot: 'super-admin-forgot-password',
        otp: 'super-admin/verify-otp',
        reset: 'super-admin/reset-password'
    }
};