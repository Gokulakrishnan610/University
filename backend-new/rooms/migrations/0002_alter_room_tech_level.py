
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('rooms', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='room',
            name='tech_level',
            field=models.CharField(blank=True, choices=[('null', 'Null'), ('high', 'High'), ('low', 'Low'), ('medium', 'Medium')], default='null', verbose_name='Tech Level'),
        ),
    ]
