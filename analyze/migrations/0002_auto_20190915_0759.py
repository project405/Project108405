# Generated by Django 2.2.4 on 2019-09-15 07:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('analyze', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='text',
            name='number',
            field=models.IntegerField(null=True),
        ),
        migrations.AddField(
            model_name='text',
            name='url',
            field=models.URLField(default='www.ntub.edu.tw'),
        ),
    ]
