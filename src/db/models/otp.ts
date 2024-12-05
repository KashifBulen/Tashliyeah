import { Model, DataTypes } from 'sequelize';
import connection from '../sequelize';
import { UUID } from 'crypto';
import { v4 as uuidv4 } from 'uuid';



interface OtpAttributes {
    id?: UUID;
    otp?: number;
    otpExpire?: Date;
    email?: string;
    verify?: string;

    updatedAt?: Date;
    createdAt?: Date;
}

class Otp extends Model<OtpAttributes> implements OtpAttributes {
    public id!: UUID;
    public otp!: number;
    public otpExpire!: Date;
    public email!: string;
    public verify!: string;

    public readonly updatedAt!: Date;
    public readonly createdAt!: Date;
}

Otp.init(
    {
        id: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: () => uuidv4(),
        },
        otp: {
            allowNull: true,
            type: DataTypes.INTEGER,
        },
        otpExpire: {
            allowNull: false,
            type: DataTypes.DATE,
        },
        email: {
            allowNull: false,
            type: DataTypes.STRING,
        },
        verify: {
            allowNull: true,
            defaultValue: "n",
            type: DataTypes.ENUM("y", "n"),
        },
        createdAt: {
            allowNull: false,
            type: DataTypes.DATE,
        },
        updatedAt: {
            allowNull: false,
            type: DataTypes.DATE,
        },
    },
    {
        sequelize: connection,
        modelName: 'Otp',
    }
);

export default Otp;
