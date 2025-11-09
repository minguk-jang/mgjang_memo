"""Add flexible alarm scheduling

Revision ID: 39ff3f059969
Revises: f12ab7163c34
Create Date: 2025-11-09 23:52:13.004377

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '39ff3f059969'
down_revision = 'f12ab7163c34'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # SQLite doesn't support ALTER COLUMN, so we need to use batch operations
    with op.batch_alter_table('alarms', schema=None) as batch_op:
        # Add new columns
        batch_op.add_column(sa.Column('alarm_type', sa.Enum('NONE', 'ONCE', 'REPEAT', name='alarmtype'), nullable=True))
        batch_op.add_column(sa.Column('alarm_time', sa.DateTime(timezone=True), nullable=True))
        batch_op.add_column(sa.Column('repeat_interval', sa.Enum('DAILY', 'WEEKLY', 'MONTHLY', name='repeatinterval'), nullable=True))
        batch_op.add_column(sa.Column('channel', sa.Enum('NONE', 'TELEGRAM', 'EMAIL', name='notificationchannel'), nullable=True))

        # Create index
        batch_op.create_index('idx_alarm_type_enabled', ['alarm_type', 'enabled'])

    # Set default values for existing rows
    op.execute("UPDATE alarms SET alarm_type = 'REPEAT' WHERE alarm_type IS NULL")
    op.execute("UPDATE alarms SET channel = 'TELEGRAM' WHERE channel IS NULL")
    op.execute("UPDATE alarms SET user_timezone = 'Asia/Seoul' WHERE user_timezone = 'UTC'")

    # Now make alarm_type and channel non-nullable
    with op.batch_alter_table('alarms', schema=None) as batch_op:
        batch_op.alter_column('alarm_type', nullable=False)
        batch_op.alter_column('channel', nullable=False)


def downgrade() -> None:
    with op.batch_alter_table('alarms', schema=None) as batch_op:
        batch_op.drop_index('idx_alarm_type_enabled')
        batch_op.drop_column('channel')
        batch_op.drop_column('repeat_interval')
        batch_op.drop_column('alarm_time')
        batch_op.drop_column('alarm_type')
