import React, {useEffect, useState} from "react";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useTranslation} from "next-i18next";
import {Button, Card, CardBody, CardHeader, Col, Container, Row} from "reactstrap";
import BreadCrumb from "../../components/BreadCrumb";


export default function Bonus() {
    const {t} = useTranslation();
    const [variableName, setVariableName] = useState('');
    const [variableValue, setVariableValue] = useState('');
    const [config, setConfig] = useState({});

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await fetch('/api/config');
                const data = await response.json();
                setConfig(data);
            } catch (error) {
                console.error('Failed to fetch configuration', error);
            }
        };

        fetchConfig();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/update-config', {
                method: 'POST', body: JSON.stringify({variableName, variableValue}), headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                console.log('Configuration updated');
            } else {
                console.error('Failed to update configuration');
            }
        } catch (error) {
            console.error('Failed to update configuration', error);
        }
    };


    return (<div className="page-content"><Container fluid>
        <BreadCrumb parent={t('chats')} title={t('new_chat')}/>
        <Card>
            <CardHeader>
                <h4 className="card-title mb-0 flex-grow-1">{t('Hi Muhammad Abdul Kahhar')}


                </h4>
            </CardHeader>
            <CardBody>
                <p>API Key: {config.API_KEY}</p>
                <p>Feature Enabled: {config.FEATURE_ENABLED ? 'Yes' : 'No'}</p>
                <form onSubmit={handleSubmit}>
                    <label>
                        Variable Name:
                        <input
                            type="text"
                            value={variableName}
                            onChange={(e) => setVariableName(e.target.value)}
                        />
                    </label>
                    <label>
                        Variable Value:
                        <input
                            type="text"
                            value={variableValue}
                            onChange={(e) => setVariableValue(e.target.value)}
                        />
                    </label>
                    <button type="submit">Update</button>
                </form>

            </CardBody>
        </Card>
    </Container>
    </div>);


}

